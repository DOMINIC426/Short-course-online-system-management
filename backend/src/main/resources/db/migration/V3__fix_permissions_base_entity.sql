-- =====================================================
-- V3 - Fix permissions table to match Permission entity
-- =====================================================

ALTER TABLE permissions
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE permissions
    ADD COLUMN updated_at TIMESTAMP;