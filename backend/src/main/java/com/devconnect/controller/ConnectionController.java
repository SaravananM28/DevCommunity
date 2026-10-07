package com.devconnect.controller;

import com.devconnect.dto.ApiResponse;
import com.devconnect.dto.ConnectionDto;
import com.devconnect.dto.UserProfileDto;
import com.devconnect.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    @Autowired
    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<ConnectionDto> sendRequest(
            @PathVariable Long receiverId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        ConnectionDto dto = connectionService.sendConnectionRequest(authentication.getName(), receiverId);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<ConnectionDto> acceptRequest(
            @PathVariable Long requestId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        ConnectionDto dto = connectionService.acceptConnectionRequest(authentication.getName(), requestId);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ConnectionDto> rejectRequest(
            @PathVariable Long requestId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        ConnectionDto dto = connectionService.rejectConnectionRequest(authentication.getName(), requestId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ConnectionDto>> getPendingRequests(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        List<ConnectionDto> list = connectionService.getPendingRequests(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<ConnectionDto>> getSentRequests(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        List<ConnectionDto> list = connectionService.getSentRequests(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserProfileDto>> getFriends(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        List<UserProfileDto> friends = connectionService.getFriends(authentication.getName());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        long count = connectionService.getPendingRequestsCount(authentication.getName());
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<ApiResponse> removeConnection(
            @PathVariable Long connectionId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        ApiResponse response = connectionService.removeConnection(authentication.getName(), connectionId);
        return ResponseEntity.ok(response);
    }
}
