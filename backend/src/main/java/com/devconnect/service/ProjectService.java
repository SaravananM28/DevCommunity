package com.devconnect.service;

import com.devconnect.dto.ApiResponse;
import com.devconnect.dto.ProjectDto;
import com.devconnect.entity.Project;
import com.devconnect.entity.User;
import com.devconnect.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, UserService userService) {
        this.projectRepository = projectRepository;
        this.userService = userService;
    }

    @Transactional
    public ProjectDto createProject(String userEmail, ProjectDto dto) {
        User user = userService.getUserByEmail(userEmail);

        Project project = new Project(
                dto.getTitle(),
                dto.getDescription(),
                dto.getTechStack(),
                dto.getRepoUrl(),
                dto.getLiveUrl(),
                user
        );

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getProjectsByUser(Long userId) {
        User user = userService.getUserById(userId);
        return projectRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse deleteProject(String userEmail, Long projectId) {
        User user = userService.getUserByEmail(userEmail);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        boolean isOwner = project.getUser().getId().equals(user.getId()) ||
                (project.getUser().getEmail() != null && project.getUser().getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isOwner) {
            throw new SecurityException("You can only delete your own projects.");
        }

        projectRepository.delete(project);
        return new ApiResponse(true, "Project deleted successfully.");
    }

    private ProjectDto mapToDto(Project p) {
        ProjectDto dto = new ProjectDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setTechStack(p.getTechStack());
        dto.setRepoUrl(p.getRepoUrl());
        dto.setLiveUrl(p.getLiveUrl());
        dto.setUserId(p.getUser().getId());
        dto.setAuthorName(p.getUser().getName());
        dto.setAuthorEmail(p.getUser().getEmail());
        dto.setAuthorHeadline(p.getUser().getHeadline());
        dto.setAuthorAvatar(p.getUser().getAvatarUrl());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
