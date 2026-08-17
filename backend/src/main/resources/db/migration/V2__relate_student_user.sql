-- Create student table matching Student.java entity
CREATE TABLE IF NOT EXISTS student (
                                       student_id BIGSERIAL PRIMARY KEY,
                                       level_of_education VARCHAR(255) NOT NULL,
                                       nationality VARCHAR(255) NOT NULL,
                                       identification_number VARCHAR(255) NOT NULL,
                                       user_id BIGINT UNIQUE,
                                       CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);