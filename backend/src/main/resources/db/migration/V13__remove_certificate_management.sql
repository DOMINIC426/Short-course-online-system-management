-- Migration: V13__remove_certificate_management.sql

-- Drop foreign keys and tables
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS certificate_templates CASCADE;