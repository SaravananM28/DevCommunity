package com.devconnect.dto;

import com.devconnect.entity.RequestStatus;
import java.time.LocalDateTime;

public class ConnectionDto {
    private Long id;
    private UserProfileDto sender;
    private UserProfileDto receiver;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ConnectionDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserProfileDto getSender() {
        return sender;
    }

    public void setSender(UserProfileDto sender) {
        this.sender = sender;
    }

    public UserProfileDto getReceiver() {
        return receiver;
    }

    public void setReceiver(UserProfileDto receiver) {
        this.receiver = receiver;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
