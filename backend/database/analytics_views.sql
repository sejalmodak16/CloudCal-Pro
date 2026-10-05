USE cloudcalc;

-- ============================================================
-- CloudCalc Pro - Power BI Analytics Views
-- ============================================================
-- 1. Calculation Summary
-- Detailed calculation information with user details
CREATE
OR REPLACE VIEW vw_calculation_summary AS
SELECT
    ch.history_id,
    ch.user_id,
    u.name AS user_name,
    u.email,
    ch.operation,
    ch.operand_a,
    ch.operand_b,
    ch.expression,
    ch.result,
    ch.created_at
FROM
    calculation_history AS ch
    INNER JOIN users AS u ON ch.user_id = u.user_id;

-- 2. User Summary
-- Total calculations performed by each user
CREATE
OR REPLACE VIEW vw_user_summary AS
SELECT
    u.user_id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    COUNT(ch.history_id) AS total_calculations
FROM
    users AS u
    LEFT JOIN calculation_history AS ch ON u.user_id = ch.user_id
GROUP BY
    u.user_id,
    u.name,
    u.email,
    u.role,
    u.created_at;

-- 3. Operation Analytics
-- Calculation statistics grouped by operation
CREATE
OR REPLACE VIEW vw_operation_analytics AS
SELECT
    operation,
    COUNT(*) AS total_calculations,
    AVG(result) AS average_result,
    MAX(result) AS highest_result,
    MIN(result) AS lowest_result
FROM
    calculation_history
GROUP BY
    operation;

-- 4. Daily Calculation Analytics
-- Calculation statistics grouped by date
CREATE
OR REPLACE VIEW vw_daily_calculations AS
SELECT
    DATE (created_at) AS calculation_date,
    COUNT(*) AS total_calculations,
    AVG(result) AS average_result,
    MAX(result) AS highest_result,
    MIN(result) AS lowest_result
FROM
    calculation_history
GROUP BY
    DATE (created_at)
ORDER BY
    calculation_date;

-- 5. User Activity Analytics
-- User calculation activity and active days
CREATE
OR REPLACE VIEW vw_user_activity AS
SELECT
    u.user_id,
    u.name,
    u.email,
    COUNT(ch.history_id) AS total_calculations,
    COUNT(DISTINCT DATE (ch.created_at)) AS active_days,
    MAX(ch.created_at) AS latest_calculation
FROM
    users AS u
    LEFT JOIN calculation_history AS ch ON u.user_id = ch.user_id
GROUP BY
    u.user_id,
    u.name,
    u.email;

-- 6. Overall Analytics
-- Overall statistics for the CloudCalc Pro application
CREATE
OR REPLACE VIEW vw_overall_analytics AS
SELECT
    COUNT(*) AS total_calculations,
    AVG(result) AS average_result,
    MAX(result) AS highest_result,
    MIN(result) AS lowest_result,
    COUNT(DISTINCT user_id) AS active_users,
    COUNT(DISTINCT DATE (created_at)) AS active_days
FROM
    calculation_history;