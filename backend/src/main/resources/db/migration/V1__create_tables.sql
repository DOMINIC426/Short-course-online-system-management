-- =====================================================
-- SCRMS V1 - Initial Database Schema
-- Uses BIGSERIAL (BIGINT auto-increment) for all primary keys
-- =====================================================

-- 1. users
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL,
    updated_at      TIMESTAMP
);

-- 2. roles
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    role_name       VARCHAR(50)  NOT NULL UNIQUE,
    description     TEXT
);

-- 3. permissions
CREATE TABLE permissions (
    id                BIGSERIAL PRIMARY KEY,
    permission_name   VARCHAR(100) NOT NULL UNIQUE,
    description       TEXT
);

-- 4. user_roles (junction)
CREATE TABLE user_roles (
    user_id         BIGINT NOT NULL,
    role_id         BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. role_permissions (junction)
CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL,
    permission_id   BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 6. students
CREATE TABLE students (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. instructors
CREATE TABLE instructors (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. coordinators
CREATE TABLE coordinators (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. market_officers
CREATE TABLE market_officers (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. course_categories
CREATE TABLE course_categories (
    id              BIGSERIAL PRIMARY KEY,
    category_name   VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP
);

-- 11. venues
CREATE TABLE venues (
    id          BIGSERIAL PRIMARY KEY,
    venue_name  VARCHAR(150) NOT NULL UNIQUE,
    capacity    INT,
    location    VARCHAR(255),
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP
);

-- 12. short_courses
CREATE TABLE short_courses (
    id                  BIGSERIAL PRIMARY KEY,
    course_code         VARCHAR(50)  NOT NULL UNIQUE,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    category_id         BIGINT,
    duration            VARCHAR(50),
    start_date          DATE,
    end_date            DATE,
    reg_open_date       DATE,
    reg_close_date      DATE,
    course_fee          DECIMAL(10,2) NOT NULL,
    max_students        INT,
    min_students        INT,
    venue_id            BIGINT,
    status              VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    created_by          BIGINT NOT NULL,
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP,
    CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_courses_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
    CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_course_status CHECK (status IN ('DRAFT','PUBLISHED','REGISTRATION_OPEN','REGISTRATION_CLOSED','ONGOING','COMPLETED','ARCHIVED','CANCELLED'))
);

-- 13. course_instructors (junction)
CREATE TABLE course_instructors (
    id              BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL,
    instructor_id   BIGINT NOT NULL,
    assigned_date   DATE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP,
    UNIQUE (course_id, instructor_id),
    FOREIGN KEY (course_id) REFERENCES short_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
);

-- 14. course_enrollments
CREATE TABLE course_enrollments (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    course_id           BIGINT NOT NULL,
    registration_date   TIMESTAMP NOT NULL,
    enrollment_status   VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    control_number      VARCHAR(50) NOT NULL UNIQUE,
    amount_required     DECIMAL(10,2) NOT NULL,
    amount_paid         DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance             DECIMAL(10,2),
    created_at          TIMESTAMP NOT NULL,
    updated_at          TIMESTAMP,
    UNIQUE (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES short_courses(id) ON DELETE CASCADE,
    CONSTRAINT chk_enrollment_status CHECK (enrollment_status IN ('PENDING','REGISTERED','ACTIVE','COMPLETED','CANCELLED')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('UNPAID','PENDING','PARTIALLY_PAID','PAID','FAILED','CANCELLED','REFUNDED'))
);

-- 15. payment_transactions
CREATE TABLE payment_transactions (
    id                      BIGSERIAL PRIMARY KEY,
    enrollment_id           BIGINT NOT NULL,
    control_number          VARCHAR(50) NOT NULL,
    transaction_reference   VARCHAR(100),
    amount                  DECIMAL(10,2) NOT NULL,
    payment_date            TIMESTAMP NOT NULL,
    payment_method          VARCHAR(30) NOT NULL,
    payment_status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    external_transaction_id VARCHAR(100),
    created_date            TIMESTAMP NOT NULL,
    created_at              TIMESTAMP NOT NULL,
    updated_at              TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT chk_transaction_status CHECK (payment_status IN ('PENDING','SUCCESSFUL','FAILED','REFUNDED'))
);

-- 16. announcements
CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    audience_type   VARCHAR(20) NOT NULL DEFAULT 'ALL',
    created_by      BIGINT NOT NULL,
    created_date    TIMESTAMP NOT NULL,
    expiry_date     TIMESTAMP,
    status          VARCHAR(20) NOT NULL DEFAULT 'SENT',
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES short_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES instructors(id) ON DELETE CASCADE,
    CONSTRAINT chk_audience_type CHECK (audience_type IN ('ALL','PAID','UNPAID','SELECTED')),
    CONSTRAINT chk_announcement_status CHECK (status IN ('SENT','ARCHIVED'))
);

-- 17. notifications
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. venue_change_history
CREATE TABLE venue_change_history (
    id              BIGSERIAL PRIMARY KEY,
    course_id       BIGINT NOT NULL,
    old_venue_id    BIGINT,
    new_venue_id    BIGINT NOT NULL,
    changed_by      BIGINT NOT NULL,
    change_date     TIMESTAMP NOT NULL,
    reason          TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES short_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (old_venue_id) REFERENCES venues(id) ON DELETE SET NULL,
    FOREIGN KEY (new_venue_id) REFERENCES venues(id) ON DELETE RESTRICT,
    FOREIGN KEY (changed_by) REFERENCES instructors(id) ON DELETE RESTRICT
);

-- 19. course_progress
CREATE TABLE course_progress (
    id                          BIGSERIAL PRIMARY KEY,
    course_id                   BIGINT NOT NULL,
    progress_percentage         INT NOT NULL,
    topics_completed            TEXT,
    topics_remaining            TEXT,
    challenges                  TEXT,
    remarks                     TEXT,
    expected_completion_date    DATE,
    updated_by                  BIGINT NOT NULL,
    updated_at                  TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL,
    FOREIGN KEY (course_id) REFERENCES short_courses(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES instructors(id) ON DELETE CASCADE,
    CONSTRAINT chk_progress_percentage CHECK (progress_percentage BETWEEN 0 AND 100)
);

-- 20. certificate_eligibility
CREATE TABLE certificate_eligibility (
    id              BIGSERIAL PRIMARY KEY,
    enrollment_id   BIGINT NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason          TEXT,
    updated_by      BIGINT,
    updated_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES instructors(id) ON DELETE SET NULL,
    CONSTRAINT chk_certificate_status CHECK (status IN ('PENDING','ELIGIBLE','NOT_ELIGIBLE','APPROVED','ISSUED'))
);

-- 21. audit_logs
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(30) NOT NULL,
    entity      VARCHAR(50) NOT NULL,
    entity_id   BIGINT,
    old_value   TEXT,
    new_value   TEXT,
    timestamp   TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 22. system_settings
CREATE TABLE system_settings (
    id              BIGSERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_courses_status ON short_courses(status);
CREATE INDEX idx_courses_category ON short_courses(category_id);
CREATE INDEX idx_courses_venue ON short_courses(venue_id);
CREATE INDEX idx_enroll_student ON course_enrollments(student_id);
CREATE INDEX idx_enroll_course ON course_enrollments(course_id);
CREATE INDEX idx_enroll_payment_status ON course_enrollments(payment_status);
CREATE INDEX idx_pay_enrollment ON payment_transactions(enrollment_id);
CREATE INDEX idx_pay_control_number ON payment_transactions(control_number);
CREATE INDEX idx_pay_date ON payment_transactions(payment_date);
CREATE INDEX idx_ann_course ON announcements(course_id);
CREATE INDEX idx_ann_created_by ON announcements(created_by);
CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);
CREATE INDEX idx_venue_history_course ON venue_change_history(course_id);
CREATE INDEX idx_venue_history_changed_by ON venue_change_history(changed_by);
CREATE INDEX idx_course_progress_course ON course_progress(course_id);
CREATE INDEX idx_cert_enrollment ON certificate_eligibility(enrollment_id);
CREATE INDEX idx_cert_status ON certificate_eligibility(status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);  