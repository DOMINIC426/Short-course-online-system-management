-- =====================================================
-- V2 - Fix RBAC tables to match Java entities
-- =====================================================

-- =====================================================
-- 1. Fix permissions table
-- Java Permission entity expects column: name
-- =====================================================

ALTER TABLE permissions
    RENAME COLUMN permission_name TO name;


-- =====================================================
-- 2. Fix role_permissions table
-- Java RolePermission entity expects:
-- id, role, permission_id, created_at, updated_at
-- =====================================================

-- Remove old foreign key to roles table
ALTER TABLE role_permissions
    DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;

-- Remove old composite primary key
ALTER TABLE role_permissions
    DROP CONSTRAINT IF EXISTS role_permissions_pkey;

-- Rename role_id to role
ALTER TABLE role_permissions
    RENAME COLUMN role_id TO role;

-- Change role from BIGINT to VARCHAR
-- to match Java Role enum
ALTER TABLE role_permissions
    ALTER COLUMN role TYPE VARCHAR(50)
    USING role::VARCHAR;

-- Add ID because RolePermission extends BaseEntity
ALTER TABLE role_permissions
    ADD COLUMN id BIGSERIAL;

-- Add BaseEntity timestamp columns
ALTER TABLE role_permissions
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE role_permissions
    ADD COLUMN updated_at TIMESTAMP;

-- Make id the primary key
ALTER TABLE role_permissions
    ADD CONSTRAINT pk_role_permissions PRIMARY KEY (id);

-- Prevent duplicate role-permission assignments
ALTER TABLE role_permissions
    ADD CONSTRAINT uk_role_permission
    UNIQUE (role, permission_id);