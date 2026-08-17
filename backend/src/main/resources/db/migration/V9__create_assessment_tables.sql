-- V9__create_assessment_tables.sql

-- 1. Create Assessment Table
CREATE TABLE IF NOT EXISTS assessments (
                             id BIGSERIAL PRIMARY KEY,
                             intake_id BIGINT NOT NULL,
                             title VARCHAR(255) NOT NULL,
                             assessment_type VARCHAR(50),
                             max_score DECIMAL(5, 2),
                             weight DECIMAL(5, 2),
                             pass_mark DECIMAL(5, 2),
                             assessment_date DATE,
                             status VARCHAR(50) DEFAULT 'DRAFT',
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT fk_assessment_intake FOREIGN KEY (intake_id) REFERENCES course_intakes(id) ON DELETE CASCADE
);

-- 2. Create Assessment Results Table
CREATE TABLE IF NOT EXISTS assessment_results (
                                    id BIGSERIAL PRIMARY KEY,
                                    assessment_id BIGINT NOT NULL,
                                    enrollment_id BIGINT NOT NULL,
                                    score DECIMAL(5, 2),
                                    grade VARCHAR(10),
                                    remarks TEXT,
                                    status VARCHAR(50) DEFAULT 'PENDING',
                                    submitted_at TIMESTAMP,
                                    submitted_by BIGINT,
                                    approved_at TIMESTAMP,
                                    approved_by BIGINT,
                                    correction_reason TEXT,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT fk_result_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_result_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_result_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_result_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
-- 4. Create Final Results Table
CREATE TABLE IF NOT EXISTS final_results (
                               id BIGSERIAL PRIMARY KEY,
                               enrollment_id BIGINT NOT NULL,
                               total_score DECIMAL(5, 2),
                               final_grade VARCHAR(10),
                               outcome VARCHAR(50),
                               status VARCHAR(50) DEFAULT 'DRAFT',
                               approved_at TIMESTAMP,
                               approved_by BIGINT,
                               published_at TIMESTAMP,
                               published_by BIGINT,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               CONSTRAINT fk_final_result_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
                               CONSTRAINT fk_final_result_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
                               CONSTRAINT fk_final_result_published_by FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create Completion Records Table
CREATE TABLE IF NOT EXISTS completion_records (
                                    id BIGSERIAL PRIMARY KEY,
                                    enrollment_id BIGINT NOT NULL,
                                    attendance_eligible BOOLEAN NOT NULL,
                                    assessment_eligible BOOLEAN NOT NULL,
                                    payment_eligible BOOLEAN NOT NULL,
                                    document_eligible BOOLEAN NOT NULL,
                                    overall_eligible BOOLEAN NOT NULL,
                                    status VARCHAR(50) DEFAULT 'PENDING',
                                    evaluated_at TIMESTAMP,
                                    evaluated_by BIGINT,
                                    notes TEXT,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT fk_completion_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_completion_evaluated_by FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE SET NULL
);
-- 7. Create Certificate Templates Table
CREATE TABLE IF NOT EXISTS certificate_templates (
                                       id BIGSERIAL PRIMARY KEY,
                                       name VARCHAR(255) NOT NULL,
                                       description TEXT,
                                       template_path TEXT NOT NULL,
                                       version VARCHAR(50),
                                       active BOOLEAN NOT NULL DEFAULT TRUE,
                                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
                              id BIGSERIAL PRIMARY KEY,
                              enrollment_id BIGINT NOT NULL,
                              student_id BIGINT NOT NULL,
                              template_id BIGINT,
                              certificate_number VARCHAR(100) NOT NULL UNIQUE,
                              verification_code VARCHAR(100) NOT NULL UNIQUE,
                              issue_date DATE,
                              expiry_date DATE,
                              file_path TEXT,
                              status VARCHAR(50) DEFAULT 'DRAFT',
                              generated_at TIMESTAMP,
                              issued_at TIMESTAMP,
                              revoked_at TIMESTAMP,
                              revoked_by BIGINT,
                              revocation_reason TEXT,
                              replaced_certificate_id BIGINT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              CONSTRAINT fk_certificate_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
                              CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                              CONSTRAINT fk_certificate_template FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE SET NULL,
                              CONSTRAINT fk_certificate_revoked_by FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
                              CONSTRAINT fk_certificate_replaced FOREIGN KEY (replaced_certificate_id) REFERENCES certificates(id) ON DELETE SET NULL
);

-- 10. Create Payments Table
CREATE TABLE payments (
                          id BIGSERIAL PRIMARY KEY,
                          student_id BIGINT NOT NULL,
                          payment_reference_id VARCHAR(100) NOT NULL UNIQUE,
                          payment_transaction_id VARCHAR(100),
                          payment_date TIMESTAMP,
                          amount DECIMAL(12, 2) NOT NULL,
                          payment_method VARCHAR(50),
                          provider VARCHAR(100),
                          status VARCHAR(50) DEFAULT 'PENDING',
                          confirmed_at TIMESTAMP,
                          confirmed_by BIGINT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                          CONSTRAINT fk_payment_confirmed_by FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. Create Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
                          id BIGSERIAL PRIMARY KEY,
                          payment_id BIGINT NOT NULL,
                          receipt_number VARCHAR(100) NOT NULL UNIQUE,
                          issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          status VARCHAR(50) DEFAULT 'ISSUED',
                          CONSTRAINT fk_receipt_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 12. Create Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
                         id BIGSERIAL PRIMARY KEY,
                         payment_id BIGINT NOT NULL,
                         refund_reference VARCHAR(100) UNIQUE,
                         amount DECIMAL(12, 2) NOT NULL,
                         reason TEXT,
                         status VARCHAR(50) DEFAULT 'REQUESTED',
                         requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         requested_by BIGINT,
                         approved_at TIMESTAMP,
                         approved_by BIGINT,
                         processed_at TIMESTAMP,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
                         CONSTRAINT fk_refund_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
                         CONSTRAINT fk_refund_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Financial Performance Indexes
CREATE INDEX idx_payments_reference ON payments(payment_reference_id);
CREATE INDEX idx_receipts_lookup ON receipts(receipt_number);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);


-- 9. Certificate Optimization Indexes
CREATE INDEX idx_certificates_lookup ON certificates(certificate_number, verification_code);
CREATE INDEX idx_certificates_student ON certificates(student_id);


-- 6. Extra Performance Indexes for Lookups
CREATE INDEX idx_final_results_enrollment ON final_results(enrollment_id);
CREATE INDEX idx_completion_records_enrollment ON completion_records(enrollment_id);


-- 3. Add Indexes for Performance Optimization
CREATE INDEX idx_assessments_intake ON assessments(intake_id);
CREATE INDEX idx_assessment_results_lookup ON assessment_results(assessment_id, enrollment_id);
