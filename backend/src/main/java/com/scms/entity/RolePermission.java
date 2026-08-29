package com.scms.entity;

import com.scms.entity.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "role_permissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_role_permission",
                        columnNames = {"role", "permission_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class RolePermission extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(
            name = "role",
            nullable = false,
            length = 50
    )
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "permission_id",
            nullable = false
    )
    private Permission permission;
}