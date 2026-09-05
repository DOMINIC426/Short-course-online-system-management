-- =============================================================
-- V6 - Add missing permissions and update role-permissions for RBAC
-- Idempotent migration: safe to run multiple times.
-- Uses ON CONFLICT DO NOTHING for PostgreSQL unique constraints.
-- =============================================================


-- ---------------------------------------------------------
-- 1. Add new permissions
-- ---------------------------------------------------------

-- INSTRUCTOR permissions
INSERT INTO permissions (name, description)
VALUES
    ('INSTRUCTOR_COURSE_VENUE_UPDATE', 'Update course venue for assigned courses'),
    ('INSTRUCTOR_COURSE_PROGRESS_SUBMIT', 'Submit course progress for assigned courses'),
    ('INSTRUCTOR_COURSE_COMPLETE', 'Submit course completion for assigned courses'),
    ('INSTRUCTOR_CERTIFICATE_ELIGIBILITY', 'Manage certificate eligibility for students in assigned courses'),
    ('INSTRUCTOR_ANNOUNCEMENT_SEND', 'Send announcements to students in assigned courses')
ON CONFLICT (name) DO NOTHING;


-- MARKET_OFFICER permissions
INSERT INTO permissions (name, description)
VALUES
    ('COURSE_CREATE', 'Create a new short course'),
    ('COURSE_EDIT', 'Edit an existing short course'),
    ('COURSE_PUBLISH', 'Publish a short course'),
    ('COURSE_UNPUBLISH', 'Unpublish a short course'),
    ('CATEGORY_CREATE', 'Create a new course category'),
    ('CATEGORY_READ', 'Read course category information'),
    ('CATEGORY_UPDATE', 'Update a course category'),
    ('COURSE_FEE_SET', 'Set course fee'),
    ('COURSE_DURATION_SET', 'Set course duration'),
    ('COURSE_DATES_SET', 'Set course registration dates'),
    ('CAPACITY_SET', 'Set maximum student capacity for a course'),
    ('INSTRUCTOR_ASSIGN', 'Assign an instructor to a course'),
    ('COURSE_IMAGE_UPLOAD', 'Upload course images/banners'),
    ('COURSE_STATS_READ', 'View course registration statistics')
ON CONFLICT (name) DO NOTHING;


-- STUDENT permissions
INSERT INTO permissions (name, description)
VALUES
    ('ENROLLMENT_CREATE', 'Register/enroll in a course'),
    ('PAYMENT_CONTROL_READ', 'View student payment control number'),
    ('PAYMENT_STATUS_READ', 'Monitor student payment status'),
    ('PAYMENT_HISTORY_READ', 'View student payment history'),
    ('ANNOUNCEMENT_READ', 'View announcements for enrolled courses'),
    ('CERTIFICATE_STATUS_READ', 'View student certificate status')
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------
-- 2. Update role-permission assignments
-- ---------------------------------------------------------

-- ADMIN: Full administrative control (all permissions)
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
    'PERMISSION_CREATE', 'PERMISSION_READ',
    'PERMISSION_UPDATE', 'PERMISSION_DELETE',

    -- ROLE-PERMISSION management
    'ROLE_PERMISSION_ASSIGN', 'ROLE_PERMISSION_REMOVE',
    'ROLE_PERMISSION_READ',

    -- SYSTEM_SETTINGS
    'SYSTEM_SETTING_CREATE', 'SYSTEM_SETTING_READ',
    'SYSTEM_SETTING_UPDATE', 'SYSTEM_SETTING_DELETE',

    -- AUDIT LOGS
    'AUDIT_LOG_READ',

    -- DASHBOARD
    'DASHBOARD_READ',

    -- INSTRUCTOR
    'INSTRUCTOR_COURSE_VENUE_UPDATE',
    'INSTRUCTOR_COURSE_PROGRESS_SUBMIT',
    'INSTRUCTOR_COURSE_COMPLETE',
    'INSTRUCTOR_CERTIFICATE_ELIGIBILITY',
    'INSTRUCTOR_ANNOUNCEMENT_SEND',

    -- MARKET_OFFICER
    'COURSE_CREATE', 'COURSE_EDIT', 'COURSE_PUBLISH',
    'COURSE_UNPUBLISH', 'CATEGORY_CREATE', 'CATEGORY_READ',
    'CATEGORY_UPDATE', 'COURSE_FEE_SET', 'COURSE_DURATION_SET',
    'COURSE_DATES_SET', 'CAPACITY_SET', 'INSTRUCTOR_ASSIGN',
    'COURSE_IMAGE_UPLOAD', 'COURSE_STATS_READ',

    -- STUDENT
    'ENROLLMENT_CREATE', 'PAYMENT_CONTROL_READ',
    'PAYMENT_STATUS_READ', 'PAYMENT_HISTORY_READ',
    'ANNOUNCEMENT_READ', 'CERTIFICATE_STATUS_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- COORDINATOR: Monitoring, reports, system-wide overview
INSERT INTO role_permissions (role, permission_id)
SELECT
    'COORDINATOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- USER management
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
    'DASHBOARD_READ',

    -- COURSE stats
    'COURSE_STATS_READ',

    -- INSTRUCTOR
    'INSTRUCTOR_COURSE_VENUE_UPDATE',
    'INSTRUCTOR_COURSE_PROGRESS_SUBMIT',
    'INSTRUCTOR_COURSE_COMPLETE',
    'INSTRUCTOR_CERTIFICATE_ELIGIBILITY',
    'INSTRUCTOR_ANNOUNCEMENT_SEND'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- INSTRUCTOR: Teaching and managing assigned course-related activities
INSERT INTO role_permissions (role, permission_id)
SELECT
    'INSTRUCTOR'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- STUDENT read
    'STUDENT_READ',

    -- DASHBOARD
    'DASHBOARD_READ',

    -- INSTRUCTOR-specific operations
    'INSTRUCTOR_COURSE_VENUE_UPDATE',
    'INSTRUCTOR_COURSE_PROGRESS_SUBMIT',
    'INSTRUCTOR_COURSE_COMPLETE',
    'INSTRUCTOR_CERTIFICATE_ELIGIBILITY',
    'INSTRUCTOR_ANNOUNCEMENT_SEND'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- STUDENT: Student self-service and account activities
INSERT INTO role_permissions (role, permission_id)
SELECT
    'STUDENT'::VARCHAR,
    p.id
FROM permissions p
WHERE p.name IN (
    -- Dashboard
    'DASHBOARD_READ',

    -- Enrollment
    'ENROLLMENT_CREATE',

    -- Payment
    'PAYMENT_CONTROL_READ',
    'PAYMENT_STATUS_READ',
    'PAYMENT_HISTORY_READ',

    -- Announcements and certificates
    'ANNOUNCEMENT_READ',
    'CERTIFICATE_STATUS_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;


-- MARKETING_OFFICER: Marketing and course catalogue management
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
    'DASHBOARD_READ',

    -- Course catalogue management
    'COURSE_CREATE',
    'COURSE_EDIT',
    'COURSE_PUBLISH',
    'COURSE_UNPUBLISH',
    'CATEGORY_CREATE',
    'CATEGORY_READ',
    'CATEGORY_UPDATE',
    'COURSE_FEE_SET',
    'COURSE_DURATION_SET',
    'COURSE_DATES_SET',
    'CAPACITY_SET',
    'INSTRUCTOR_ASSIGN',
    'COURSE_IMAGE_UPLOAD',
    'COURSE_STATS_READ'
)
ON CONFLICT (role, permission_id) DO NOTHING;