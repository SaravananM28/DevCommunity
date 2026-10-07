package com.devconnect.controller;

import com.devconnect.dto.UpdateProfileRequest;
import com.devconnect.dto.UserProfileDto;
import com.devconnect.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getAllDevelopers(
            @RequestParam(required = false) String query,
            Authentication authentication) {
        String currentEmail = authentication != null ? authentication.getName() : null;
        List<UserProfileDto> users = userService.getAllDevelopers(currentEmail, query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDto> getDeveloperProfile(
            @PathVariable Long id,
            Authentication authentication) {
        String currentEmail = authentication != null ? authentication.getName() : null;
        UserProfileDto user = userService.getDeveloperProfile(id, currentEmail);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        UserProfileDto updated = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(updated);
    }
}
