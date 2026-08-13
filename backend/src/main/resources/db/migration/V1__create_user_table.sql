-- =======================================================
-- V1__create_users_table.sql
-- Description: Create users table with role enum
-- =======================================================

-- 1. Create ENUM type for user roles
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'INSTRUCTOR',
    'STUDENT',
    'COORDINATOR',
    'FINANCE_OFFICER',
    'CERTIFICATE_OFFICER',
    'QUALITY_ASSURANCE_OFFICER',
    'AUDITOR'
    );

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     first_name VARCHAR(100) NOT NULL,
                                     last_name VARCHAR(100) NOT NULL,
                                     email VARCHAR(150) NOT NULL UNIQUE,
                                     password VARCHAR(255) NOT NULL,
                                     role user_role NOT NULL,
                                     created_at DATE NOT NULL DEFAULT CURRENT_DATE,
                                     updated_at DATE
);

-- 3. Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- 4. Create index for role filtering
CREATE INDEX idx_users_role ON users(role);

