package com.devconnect.repository;

import com.devconnect.entity.ConnectionRequest;
import com.devconnect.entity.RequestStatus;
import com.devconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {

    @Query("SELECT cr FROM ConnectionRequest cr WHERE " +
           "(cr.sender = :u1 AND cr.receiver = :u2) OR " +
           "(cr.sender = :u2 AND cr.receiver = :u1) " +
           "ORDER BY cr.updatedAt DESC")
    List<ConnectionRequest> findConnectionsBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    default Optional<ConnectionRequest> findConnectionBetweenUsers(User u1, User u2) {
        List<ConnectionRequest> list = findConnectionsBetweenUsers(u1, u2);
        return (list != null && !list.isEmpty()) ? Optional.of(list.get(0)) : Optional.empty();
    }

    List<ConnectionRequest> findByReceiverAndStatusOrderByCreatedAtDesc(User receiver, RequestStatus status);

    List<ConnectionRequest> findBySenderOrderByCreatedAtDesc(User sender);

    @Query("SELECT cr FROM ConnectionRequest cr WHERE cr.status = :status AND " +
           "(cr.sender = :user OR cr.receiver = :user) ORDER BY cr.updatedAt DESC")
    List<ConnectionRequest> findAllAcceptedConnections(@Param("user") User user, @Param("status") RequestStatus status);

    long countByReceiverAndStatus(User receiver, RequestStatus status);
}
