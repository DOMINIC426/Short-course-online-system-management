-- Migration: V14__remove_invoices_level_of_education_and_update_roles.sql

-- 1. Drop tables depending on invoices
DROP TABLE IF EXISTS payment_allocations CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoice_discounts CASCADE;

-- 2. Drop the main invoices table
DROP TABLE IF EXISTS invoices CASCADE;

-- 3. Remove level_of_education column from students table
ALTER TABLE student DROP COLUMN IF EXISTS level_of_education;

-- 4. Drop role column and recreate native enum type
ALTER TABLE users DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('ADMIN', 'COORDINATOR', 'INSTRUCTOR', 'STUDENT', 'MARKETING_OFFICER');

ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'STUDENT';