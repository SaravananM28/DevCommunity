package com.devconnect.service;

import com.devconnect.dto.AuthResponse;
import com.devconnect.dto.LoginRequest;
import com.devconnect.dto.RegisterRequest;
import com.devconnect.dto.UserProfileDto;
import com.devconnect.entity.User;
import com.devconnect.repository.UserRepository;
import com.devconnect.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists!");
        }

        String avatar = request.getAvatarUrl();
        if (!StringUtils.hasText(avatar)) {
            avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getName().replaceAll("\\s+", "");
        }

        User user = new User(
                request.getName().trim(),
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getHeadline(),
                request.getBio(),
                request.getSkills(),
                avatar,
                request.getGithubUrl(),
                request.getLinkedinUrl(),
                request.getLocation()
        );

        User savedUser = userRepository.save(user);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        UserProfileDto profileDto = userService.convertToDto(savedUser, savedUser);

        return new AuthResponse(token, profileDto);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        User user = userService.getUserByEmail(request.getEmail().toLowerCase().trim());
        UserProfileDto profileDto = userService.convertToDto(user, user);

        return new AuthResponse(token, profileDto);
    }

    public UserProfileDto getCurrentUser(String email) {
        User user = userService.getUserByEmail(email);
        return userService.convertToDto(user, user);
    }
}
