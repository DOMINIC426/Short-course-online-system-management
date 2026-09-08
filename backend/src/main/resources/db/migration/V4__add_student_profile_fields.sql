-- =====================================================
-- V4 - Add student profile fields
-- Adds education level, nationality, and identification number columns
-- =====================================================

ALTER TABLE students
ADD COLUMN level_of_education VARCHAR(100),
ADD COLUMN nationality VARCHAR(100),
ADD COLUMN identification_number VARCHAR(50);
