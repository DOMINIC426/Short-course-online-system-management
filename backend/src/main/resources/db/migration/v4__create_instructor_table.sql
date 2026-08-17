
CREATE TABLE IF  NOT EXISTS instructor(
    instructor_id BIGSERIAL PRIMARY KEY,
    expertise VARCHAR(255) NOT NULL ,
    qualification VARCHAR(255) NOT NULL ,
    user_id BIGINT UNIQUE,
    created_at DATE DEFAULT  CURRENT_DATE,
    CONSTRAINT fk_instructor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE

);