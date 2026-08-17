-- V11__complete_financial_domain.sql

-- 1. Upgrade the Discounts Table to match full requirements
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS discount_type VARCHAR(50) DEFAULT 'PERCENTAGE';
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS value DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Create Reconciliations Table
CREATE TABLE IF NOT EXISTS reconciliations (

                                               id BIGSERIAL PRIMARY KEY,
                                               payment_id BIGINT NOT NULL UNIQUE,
                                               reconciliation_reference VARCHAR(100) UNIQUE,
                                               amount DECIMAL(12, 2) NOT NULL,
                                               status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
                                               reconciled_at TIMESTAMP,
                                               reconciled_by BIGINT,
                                               notes TEXT,
                                               CONSTRAINT fk_reconciliation_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
                                               CONSTRAINT fk_reconciliation_user FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Create Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
                                                      id BIGSERIAL PRIMARY KEY,
                                                      name VARCHAR(255) NOT NULL,
                                                      event_type VARCHAR(100) NOT NULL,
                                                      channel VARCHAR(50) NOT NULL,
                                                      subject VARCHAR(255),
                                                      body TEXT NOT NULL,
                                                      active BOOLEAN NOT NULL DEFAULT TRUE,
                                                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
                                          id BIGSERIAL PRIMARY KEY,
                                          actor_user_id BIGINT,
                                          action VARCHAR(50) NOT NULL,
                                          entity_type VARCHAR(100) NOT NULL,
                                          entity_id VARCHAR(100) NOT NULL,
                                          old_values TEXT,
                                          new_values TEXT,
                                          ip_address VARCHAR(45),
                                          user_agent TEXT,
                                          request_id VARCHAR(100),
                                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Create System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
                                               id BIGSERIAL PRIMARY KEY,
                                               setting_key VARCHAR(100) NOT NULL UNIQUE,
                                               setting_value TEXT NOT NULL,
                                               data_type VARCHAR(50) DEFAULT 'STRING',
                                               description TEXT,
                                               updated_by BIGINT,
                                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                               CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Create Verifications Table
CREATE TABLE IF NOT EXISTS verifications (
                                             id BIGSERIAL PRIMARY KEY,
                                             user_id BIGINT,
                                             template_id BIGINT,
                                             code VARCHAR(100) NOT NULL,
                                             message TEXT,
                                             channel VARCHAR(50),
                                             status VARCHAR(50) DEFAULT 'PENDING',
                                             sent_at TIMESTAMP,
                                             used_at TIMESTAMP,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                             CONSTRAINT fk_verification_template FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL
);

-- 8. Core Maintenance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_lookup ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verifications_code ON verifications(code);


-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_reconciliations_ref ON reconciliations(reconciliation_reference);
