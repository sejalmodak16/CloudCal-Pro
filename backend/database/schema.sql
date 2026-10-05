CREATE DATABASE IF NOT EXISTS cloudcalc;

USE cloudcalc;

CREATE TABLE
    IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS calculation_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        operation VARCHAR(20) NOT NULL,
        operand_a DECIMAL(20, 8) NOT NULL,
        operand_b DECIMAL(20, 8) NOT NULL,
        expression VARCHAR(255),
        result DECIMAL(30, 8) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_calculation_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        INDEX idx_calculation_user (user_id),
        INDEX idx_calculation_date (created_at)
    );