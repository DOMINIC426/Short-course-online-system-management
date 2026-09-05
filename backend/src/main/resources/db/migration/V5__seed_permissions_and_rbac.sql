-- =============================================================
-- V5 - Seed permissions and role-permissions for RBAC
-- =============================================================
-- Idempotent migration for PostgreSQL.
-- =============================================================


-- ---------------------------------------------------------
-- 1. Seed permissions
-- ---------------------------------------------------------

-- USER permissions
INSERT INTO permissions (name, description)
VALUES
    ('USER_CREATE', 'Create a new user'),
    ('USER_READ', 'Read user information'),
    ('USER_UPDATE', 'Update user information'),
    ('USER_ACTIVATE', 'Activate a user'),
    ('USER_DEACTIVATE', 'Deactivate a user'),
    ('USER_RESET_PASSWORD', 'Reset user password'),
    ('USER_ASSIGN_ROLE', 'Assign or change user role')
ON CONFLICT (name) DO NOTHING;


-- STUDENT permissions
INSERT INTO permissions (name, description)
VALUES
    ('STUDENT_READ', 'Read student information'),
    ('STUDENT_SEARCH', 'Search for students'),
    ('STUDENT_UPDATE', 'Update student information'),
    ('STUDENT_ACTIVATE', 'Activate a student'),
    ('STUDENT_DEACTIVATE', 'Deactivate a student')
ON CONFLICT (name) DO NOTHING;


-- ROLE permissions
INSERT INTO permissions (name, description)
VALUES
    ('ROLE_READ', 'Read role information'),
    ('ROLE_ASSIGN', 'Assign or change user role')
ON CONFLICT (name) DO NOTHING;


-- PERMISSION permissions
INSERT INTO permissions (name, description)
VALUES
    ('PERMISSION_CREATE', 'Create a new permission'),
    ('PERMISSION_READ', 'Read permission information'),
    ('PERMISSION_UPDATE', 'Update a permission'),
    ('PERMISSION_DELETE', 'Delete a permission')
ON CONFLICT (name) DO NOTHING;


-- ROLE_PERMISSION permissions
INSERT INTO permissions (name, description)
VALUES
    ('ROLE_PERMISSION_ASSIGN', 'Assign a permission to a role'),
    ('ROLE_PERMISSION_REMOVE', 'Remove a permission from a role'),
    ('ROLE_PERMISSION_READ', 'Read permissions assigned to a role')
ON CONFLICT (name) DO NOTHING;


-- SYSTEM_SETTING permissions
INSERT INTO permissions (name, description)
VALUES
    ('SYSTEM_SETTING_CREATE', 'Create a system setting'),
    ('SYSTEM_SETTING_READ', 'Read a system setting'),
    ('SYSTEM_SETTING_UPDATE', 'Update a system setting'),
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

-- ADMIN
INSERT INTO role_permissions (role, permission_id)
SELECT
    'ADMIN'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    'USER_CREATE',
    'USER_READ',
    'USER_UPDATE',
    'USER_ACTIVATE',
    'USER_DEACTIVATE',
    'USER_RESET_PASSWORD',
    'USER_ASSIGN_ROLE',

    'STUDENT_READ',
    'STUDENT_SEARCH',
    'STUDENT_UPDATE',
    'STUDENT_ACTIVATE',
    'STUDENT_DEACTIVATE',

    'ROLE_READ',
    'ROLE_ASSIGN',

    'PERMISSION_CREATE',
    'PERMISSION_READ',
    'PERMISSION_UPDATE',
    'PERMISSION_DELETE',

    'ROLE_PERMISSION_ASSIGN',
    'ROLE_PERMISSION_REMOVE',
    'ROLE_PERMISSION_READ',

    'SYSTEM_SETTING_CREATE',
    'SYSTEM_SETTING_READ',
    'SYSTEM_SETTING_UPDATE',
    'SYSTEM_SETTING_DELETE',

    'AUDIT_LOG_READ',

    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- COORDINATOR
INSERT INTO role_permissions (role, permission_id)
SELECT
    'COORDINATOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    'USER_READ',
    'USER_UPDATE',

    'STUDENT_READ',
    'STUDENT_SEARCH',
    'STUDENT_UPDATE',

    'ROLE_READ',
    'ROLE_ASSIGN',

    'PERMISSION_READ',

    'SYSTEM_SETTING_READ',

    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- INSTRUCTOR
INSERT INTO role_permissions (role, permission_id)
SELECT
    'INSTRUCTOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    'STUDENT_READ',
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- STUDENT
INSERT INTO role_permissions (role, permission_id)
SELECT
    'STUDENT'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- MARKETING OFFICER
INSERT INTO role_permissions (role, permission_id)
SELECT
    'MARKETING_OFFICER'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    'USER_READ',
    'SYSTEM_SETTING_READ',
    'DASHBOARD_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;