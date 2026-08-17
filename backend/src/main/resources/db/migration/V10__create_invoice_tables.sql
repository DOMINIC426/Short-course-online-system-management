-- V10__create_invoice_tables.sql

-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
                                        id BIGSERIAL PRIMARY KEY,
                                        student_id BIGINT NOT NULL,
                                        intake_id BIGINT,
                                        invoice_number VARCHAR(100) NOT NULL UNIQUE,
                                        issue_date DATE NOT NULL,
                                        due_date DATE NOT NULL,
                                        status VARCHAR(50) DEFAULT 'DRAFT',
                                        subtotal_amount DECIMAL(12, 2) NOT NULL,
                                        discount_amount DECIMAL(12, 2) DEFAULT 0.00,
                                        tax_amount DECIMAL(12, 2) DEFAULT 0.00,
                                        total_amount DECIMAL(12, 2) NOT NULL,
                                        paid_amount DECIMAL(12, 2) DEFAULT 0.00,
                                        balance_amount DECIMAL(12, 2) DEFAULT 0.00,
                                        notes TEXT,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        CONSTRAINT fk_invoice_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
                                        CONSTRAINT fk_invoice_intake FOREIGN KEY (intake_id) REFERENCES course_intakes(id) ON DELETE SET NULL
);

-- 2. Create Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
                                             id BIGSERIAL PRIMARY KEY,
                                             invoice_id BIGINT NOT NULL,
                                             description VARCHAR(255) NOT NULL,
                                             quantity INT NOT NULL,
                                             unit_amount DECIMAL(12, 2) NOT NULL,
                                             total_amount DECIMAL(12, 2) NOT NULL,
                                             CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 3. Placeholder Discounts Lookup Table (Ensures InvoiceDiscounts fk compiles cleanly)
CREATE TABLE IF NOT EXISTS discounts (
                                         id BIGSERIAL PRIMARY KEY,
                                         code VARCHAR(50) NOT NULL UNIQUE,
                                         description VARCHAR(255),
                                         percentage DECIMAL(5, 2),
                                         active BOOLEAN DEFAULT TRUE,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Invoice Discounts Table
CREATE TABLE IF NOT EXISTS invoice_discounts (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 invoice_id BIGINT NOT NULL,
                                                 discount_id BIGINT NOT NULL,
                                                 amount DECIMAL(12, 2) NOT NULL,
                                                 CONSTRAINT fk_invoice_discount_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
                                                 CONSTRAINT fk_invoice_discount_lookup FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE RESTRICT
);

-- 5. Create Payment Allocations Table
CREATE TABLE IF NOT EXISTS payment_allocations (
                                                   id BIGSERIAL PRIMARY KEY,
                                                   payment_id BIGINT NOT NULL,
                                                   invoice_id BIGINT NOT NULL,
                                                   allocated_amount DECIMAL(12, 2) NOT NULL,
                                                   allocated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                   CONSTRAINT fk_allocation_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
                                                   CONSTRAINT fk_allocation_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 6. Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_lookup ON invoices(invoice_number, status);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_composite ON payment_allocations(payment_id, invoice_id);
