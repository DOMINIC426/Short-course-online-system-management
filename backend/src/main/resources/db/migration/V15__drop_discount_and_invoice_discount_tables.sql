-- Drop dependent joining tables or foreign key references if present
DROP TABLE IF EXISTS invoice_discount CASCADE;

-- Drop the discounts table
DROP TABLE IF EXISTS discount CASCADE;

DROP TABLE IF EXISTS reconciliation ;