-- 1. Remove the default value that relies on the user_role enum
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- 2. Convert the column type from enum to VARCHAR
ALTER TABLE users
    ALTER COLUMN role TYPE VARCHAR(50)
        USING role::VARCHAR;

-- 3. (Optional) Re-apply a default as a VARCHAR if needed
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- 4. Safely drop the enum type now that dependencies are gone
DROP TYPE IF EXISTS user_role CASCADE;