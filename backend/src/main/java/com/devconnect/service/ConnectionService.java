package com.devconnect.service;

import com.devconnect.dto.ApiResponse;
import com.devconnect.dto.ConnectionDto;
import com.devconnect.dto.UserProfileDto;
import com.devconnect.entity.ConnectionRequest;
import com.devconnect.entity.RequestStatus;
import com.devconnect.entity.User;
import com.devconnect.repository.ConnectionRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private final ConnectionRequestRepository connectionRequestRepository;
    private final UserService userService;

    @Autowired
    public ConnectionService(ConnectionRequestRepository connectionRequestRepository,
                             UserService userService) {
        this.connectionRequestRepository = connectionRequestRepository;
        this.userService = userService;
    }

    @Transactional
    public ConnectionDto sendConnectionRequest(String senderEmail, Long receiverId) {
        User sender = userService.getUserByEmail(senderEmail);
        User receiver = userService.getUserById(receiverId);

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot send a connection request to yourself.");
        }

        Optional<ConnectionRequest> existingOpt = connectionRequestRepository.findConnectionBetweenUsers(sender, receiver);
        ConnectionRequest request;

        if (existingOpt.isPresent()) {
            request = existingOpt.get();
            if (request.getStatus() == RequestStatus.ACCEPTED) {
                throw new IllegalStateException("You are already connected with " + receiver.getName());
            }
            if (request.getStatus() == RequestStatus.PENDING) {
                boolean isSender = request.getSender().getId().equals(sender.getId()) ||
                        (request.getSender().getEmail() != null && request.getSender().getEmail().equalsIgnoreCase(sender.getEmail()));
                if (isSender) {
                    throw new IllegalStateException("Connection request already sent and pending.");
                } else {
                    // Receiver is sending to sender who already requested; auto-accept!
                    request.setStatus(RequestStatus.ACCEPTED);
                    request.setUpdatedAt(LocalDateTime.now());
                    return mapToDto(connectionRequestRepository.save(request), sender);
                }
            }
            // If REJECTED previously, clean up old record so fresh request can be created cleanly
            connectionRequestRepository.delete(request);
            connectionRequestRepository.flush();
        }

        request = new ConnectionRequest(sender, receiver);
        ConnectionRequest saved = connectionRequestRepository.save(request);
        return mapToDto(saved, sender);
    }

    @Transactional
    public ConnectionDto acceptConnectionRequest(String receiverEmail, Long requestId) {
        User receiver = userService.getUserByEmail(receiverEmail);
        ConnectionRequest request = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found with id: " + requestId));

        boolean isAuthorized = request.getReceiver().getId().equals(receiver.getId()) ||
                (request.getReceiver().getEmail() != null && request.getReceiver().getEmail().equalsIgnoreCase(receiver.getEmail()));

        if (!isAuthorized) {
            throw new SecurityException("You are not authorized to accept this connection request.");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        ConnectionRequest updated = connectionRequestRepository.save(request);
        return mapToDto(updated, receiver);
    }

    @Transactional
    public ConnectionDto rejectConnectionRequest(String receiverEmail, Long requestId) {
        User receiver = userService.getUserByEmail(receiverEmail);
        ConnectionRequest request = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Connection request not found with id: " + requestId));

        boolean isAuthorized = request.getReceiver().getId().equals(receiver.getId()) ||
                (request.getReceiver().getEmail() != null && request.getReceiver().getEmail().equalsIgnoreCase(receiver.getEmail()));

        if (!isAuthorized) {
            throw new SecurityException("You are not authorized to reject this connection request.");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());
        ConnectionRequest updated = connectionRequestRepository.save(request);
        return mapToDto(updated, receiver);
    }

    public List<ConnectionDto> getPendingRequests(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<ConnectionRequest> requests = connectionRequestRepository.findByReceiverAndStatusOrderByCreatedAtDesc(user, RequestStatus.PENDING);
        return requests.stream()
                .map(req -> mapToDto(req, user))
                .collect(Collectors.toList());
    }

    public List<ConnectionDto> getSentRequests(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<ConnectionRequest> requests = connectionRequestRepository.findBySenderOrderByCreatedAtDesc(user);
        return requests.stream()
                .filter(req -> req.getStatus() == RequestStatus.PENDING)
                .map(req -> mapToDto(req, user))
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getFriends(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<ConnectionRequest> acceptedList = connectionRequestRepository.findAllAcceptedConnections(user, RequestStatus.ACCEPTED);

        return acceptedList.stream()
                .map(req -> {
                    User friend = req.getSender().getId().equals(user.getId()) ? req.getReceiver() : req.getSender();
                    UserProfileDto friendDto = userService.convertToDto(friend, user);
                    friendDto.setConnectionStatus("CONNECTED");
                    friendDto.setConnectionRequestId(req.getId());
                    return friendDto;
                })
                .collect(Collectors.toList());
    }

    public long getPendingRequestsCount(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return connectionRequestRepository.countByReceiverAndStatus(user, RequestStatus.PENDING);
    }

    @Transactional
    public ApiResponse removeConnection(String userEmail, Long connectionId) {
        User user = userService.getUserByEmail(userEmail);
        ConnectionRequest request = connectionRequestRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found with id: " + connectionId));

        boolean isAuthorized = request.getSender().getId().equals(user.getId()) ||
                request.getReceiver().getId().equals(user.getId()) ||
                (request.getSender().getEmail() != null && request.getSender().getEmail().equalsIgnoreCase(user.getEmail())) ||
                (request.getReceiver().getEmail() != null && request.getReceiver().getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isAuthorized) {
            throw new SecurityException("You are not authorized to remove this connection.");
        }

        connectionRequestRepository.delete(request);
        return new ApiResponse(true, "Connection removed successfully.");
    }

    private ConnectionDto mapToDto(ConnectionRequest req, User currentUser) {
        ConnectionDto dto = new ConnectionDto();
        dto.setId(req.getId());
        dto.setSender(userService.convertToDto(req.getSender(), currentUser));
        dto.setReceiver(userService.convertToDto(req.getReceiver(), currentUser));
        dto.setStatus(req.getStatus());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setUpdatedAt(req.getUpdatedAt());
        return dto;
    }
}
