-- =============================================================
-- V5 - Seed permissions and role-permissions for RBAC
-- =============================================================
-- Idempotent migration: safe to run multiple times.
-- Uses ON CONFLICT DO NOTHING for PostgreSQL unique constraints.
-- =============================================================

-- ---------------------------------------------------------
-- 1. Seed permissions
-- ---------------------------------------------------------
-- USER permissions
INSERT INTO permissions (name, description)
VALUES
    ('USER_CREATE', 'Create a new user')
    ON CONFLICT (name) DO NOTHING,

    ('USER_READ', 'Read user information')
    ON CONFLICT (name) DO NOTHING,

    ('USER_UPDATE', 'Update user information')
    ON CONFLICT (name) DO NOTHING,

    ('USER_ACTIVATE', 'Activate a user')
    ON CONFLICT (name) DO NOTHING,

    ('USER_DEACTIVATE', 'Deactivate a user')
    ON CONFLICT (name) DO NOTHING,

    ('USER_RESET_PASSWORD', 'Reset user password')
    ON CONFLICT (name) DO NOTHING,

    ('USER_ASSIGN_ROLE', 'Assign or change user role')
    ON CONFLICT (name) DO NOTHING;

-- STUDENT permissions
INSERT INTO permissions (name, description)
VALUES
    ('STUDENT_READ', 'Read student information')
    ON CONFLICT (name) DO NOTHING,

    ('STUDENT_SEARCH', 'Search for students')
    ON CONFLICT (name) DO NOTHING,

    ('STUDENT_UPDATE', 'Update student information')
    ON CONFLICT (name) DO NOTHING,

    ('STUDENT_ACTIVATE', 'Activate a student')
    ON CONFLICT (name) DO NOTHING,

    ('STUDENT_DEACTIVATE', 'Deactivate a student')
    ON CONFLICT (name) DO NOTHING;

-- ROLE permissions
INSERT INTO permissions (name, description)
VALUES
    ('ROLE_READ', 'Read role information')
    ON CONFLICT (name) DO NOTHING,

    ('ROLE_ASSIGN', 'Assign or change user role')
    ON CONFLICT (name) DO NOTHING;

-- PERMISSION permissions
INSERT INTO permissions (name, description)
VALUES
    ('PERMISSION_CREATE', 'Create a new permission')
    ON CONFLICT (name) DO NOTHING,

    ('PERMISSION_READ', 'Read permission information')
    ON CONFLICT (name) DO NOTHING,

    ('PERMISSION_UPDATE', 'Update a permission')
    ON CONFLICT (name) DO NOTHING,

    ('PERMISSION_DELETE', 'Delete a permission')
    ON CONFLICT (name) DO NOTHING;

-- ROLE_PERMISSION permissions
INSERT INTO permissions (name, description)
VALUES
    ('ROLE_PERMISSION_ASSIGN', 'Assign a permission to a role')
    ON CONFLICT (name) DO NOTHING,

    ('ROLE_PERMISSION_REMOVE', 'Remove a permission from a role')
    ON CONFLICT (name) DO NOTHING,

    ('ROLE_PERMISSION_READ', 'Read permissions assigned to a role')
    ON CONFLICT (name) DO NOTHING;

-- SYSTEM_SETTING permissions
INSERT INTO permissions (name, description)
VALUES
    ('SYSTEM_SETTING_CREATE', 'Create a system setting')
    ON CONFLICT (name) DO NOTHING,

    ('SYSTEM_SETTING_READ', 'Read a system setting')
    ON CONFLICT (name) DO NOTHING,

    ('SYSTEM_SETTING_UPDATE', 'Update a system setting')
    ON CONFLICT (name) DO NOTHING,

    ('SYSTEM_SETTING_DELETE', 'Delete a system setting')
    ON CONFLICT (name) DO NOTHING;

-- AUDIT_LOG permission
INSERT INTO permissions (name, description)
VALUES
    ('AUDIT_LOG_READ', 'Read audit logs')
    ON CONFLICT (name) DO NOTHING;

-- DASHBOARD permission
INSERT INTO permissions (name, description)
VALUES
    ('DASHBOARD_READ', 'Read dashboard information')
    ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------
-- 2. Seed role-permission assignments
-- ---------------------------------------------------------
-- ADMIN: Full administrative control - all permissions
INSERT INTO role_permissions (role, permission_id)
SELECT
    'ADMIN'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- USER management
    'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_ACTIVATE',
    'USER_DEACTIVATE', 'USER_RESET_PASSWORD', 'USER_ASSIGN_ROLE',
    -- STUDENT management
    'STUDENT_READ', 'STUDENT_SEARCH', 'STUDENT_UPDATE',
    'STUDENT_ACTIVATE', 'STUDENT_DEACTIVATE',
    -- ROLE management
    'ROLE_READ', 'ROLE_ASSIGN',
    -- PERMISSION management
    'PERMISSION_CREATE', 'PERMISSION_READ', 'PERMISSION_UPDATE', 'PERMISSION_DELETE',
    -- ROLE-PERMISSION management
    'ROLE_PERMISSION_ASSIGN', 'ROLE_PERMISSION_REMOVE', 'ROLE_PERMISSION_READ',
    -- SYSTEM_SETTINGS
    'SYSTEM_SETTING_CREATE', 'SYSTEM_SETTING_READ', 'SYSTEM_SETTING_UPDATE', 'SYSTEM_SETTING_DELETE',
    -- AUDIT LOGS
    'AUDIT_LOG_READ',
    -- DASHBOARD
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- COORDINATOR: Monitoring, instructor updates, payments, student statistics, reports
INSERT INTO role_permissions (role, permission_id)
SELECT
    'COORDINATOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- USER management (read/update)
    'USER_READ', 'USER_UPDATE',
    -- STUDENT management
    'STUDENT_READ', 'STUDENT_SEARCH', 'STUDENT_UPDATE',
    -- ROLE management
    'ROLE_READ', 'ROLE_ASSIGN',
    -- PERMISSION read
    'PERMISSION_READ',
    -- SYSTEM_SETTINGS
    'SYSTEM_SETTING_READ',
    -- DASHBOARD
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- INSTRUCTOR: Teaching and managing assigned course-related activities
INSERT INTO role_permissions (role, permission_id)
SELECT
    'INSTRUCTOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- STUDENT read (own students)
    'STUDENT_READ',
    -- DASHBOARD
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- STUDENT: Student access and activities
INSERT INTO role_permissions (role, permission_id)
SELECT
    'STUDENT'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- Dashboard access
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- MARKETING_OFFICER: Marketing activities
INSERT INTO role_permissions (role, permission_id)
SELECT
    'MARKETING_OFFICER'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- USER read
    'USER_READ',
    -- SYSTEM_SETTINGS
    'SYSTEM_SETTING_READ',
    -- DASHBOARD
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;