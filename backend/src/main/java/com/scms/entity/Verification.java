
package com.scms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private NotificationTemplate template;

    @Column(nullable = false)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String channel; // e.g., EMAIL, SMS

    private String status = "PENDING"; // e.g., PENDING, VERIFIED, EXPIRED

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "used_at")
    private LocalDateTime used_at;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
