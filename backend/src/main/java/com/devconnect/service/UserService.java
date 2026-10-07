package com.devconnect.service;

import com.devconnect.dto.UpdateProfileRequest;
import com.devconnect.dto.UserProfileDto;
import com.devconnect.entity.ConnectionRequest;
import com.devconnect.entity.RequestStatus;
import com.devconnect.entity.User;
import com.devconnect.repository.ConnectionRequestRepository;
import com.devconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ConnectionRequestRepository connectionRequestRepository;

    @Autowired
    public UserService(UserRepository userRepository, ConnectionRequestRepository connectionRequestRepository) {
        this.userRepository = userRepository;
        this.connectionRequestRepository = connectionRequestRepository;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public List<UserProfileDto> getAllDevelopers(String currentEmail, String query) {
        User currentUser = null;
        if (StringUtils.hasText(currentEmail)) {
            currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        }

        List<User> users;
        if (StringUtils.hasText(query)) {
            users = userRepository.searchUsers(query.trim());
        } else {
            users = userRepository.findAll();
        }

        final User finalCurrentUser = currentUser;
        return users.stream()
                .map(user -> convertToDto(user, finalCurrentUser))
                .collect(Collectors.toList());
    }

    public UserProfileDto getDeveloperProfile(Long id, String currentEmail) {
        User user = getUserById(id);
        User currentUser = null;
        if (StringUtils.hasText(currentEmail)) {
            currentUser = userRepository.findByEmail(currentEmail).orElse(null);
        }
        return convertToDto(user, currentUser);
    }

    public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        user.setName(request.getName());
        user.setHeadline(request.getHeadline());
        user.setBio(request.getBio());
        user.setSkills(request.getSkills());
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());
        user.setLocation(request.getLocation());

        User updated = userRepository.save(user);
        return convertToDto(updated, updated);
    }

    public UserProfileDto convertToDto(User targetUser, User currentUser) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(targetUser.getId());
        dto.setName(targetUser.getName());
        dto.setEmail(targetUser.getEmail());
        dto.setHeadline(targetUser.getHeadline());
        dto.setBio(targetUser.getBio());
        dto.setSkills(targetUser.getSkills());
        dto.setAvatarUrl(targetUser.getAvatarUrl());
        dto.setGithubUrl(targetUser.getGithubUrl());
        dto.setLinkedinUrl(targetUser.getLinkedinUrl());
        dto.setLocation(targetUser.getLocation());
        dto.setCreatedAt(targetUser.getCreatedAt());

        if (currentUser == null) {
            dto.setConnectionStatus("NONE");
            return dto;
        }

        if (currentUser.getId().equals(targetUser.getId())) {
            dto.setConnectionStatus("SELF");
            return dto;
        }

        Optional<ConnectionRequest> reqOpt = connectionRequestRepository.findConnectionBetweenUsers(currentUser, targetUser);
        if (reqOpt.isPresent()) {
            ConnectionRequest req = reqOpt.get();
            dto.setConnectionRequestId(req.getId());
            if (req.getStatus() == RequestStatus.ACCEPTED) {
                dto.setConnectionStatus("CONNECTED");
            } else if (req.getStatus() == RequestStatus.PENDING) {
                if (req.getSender().getId().equals(currentUser.getId())) {
                    dto.setConnectionStatus("PENDING_SENT");
                } else {
                    dto.setConnectionStatus("PENDING_RECEIVED");
                }
            } else {
                dto.setConnectionStatus("NONE");
            }
        } else {
            dto.setConnectionStatus("NONE");
        }

        return dto;
    }
}
