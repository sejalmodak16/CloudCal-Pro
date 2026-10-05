USE cloudcalc;

INSERT INTO
    users (name, email, password_hash, role)
VALUES
    (
        'Sejal Modak',
        'sejal@example.com',
        'demo_hash_123',
        'user'
    ),
    (
        'Harshali Katkar',
        'harshali@example.com',
        'demo_hash_123',
        'user'
    ),
    (
        'Aarav Sharma',
        'aarav@example.com',
        'demo_hash_123',
        'user'
    ),
    (
        'Ananya Patil',
        'ananya@example.com',
        'demo_hash_123',
        'user'
    ),
    (
        'Rohan Deshmukh',
        'rohan@example.com',
        'demo_hash_123',
        'user'
    );

INSERT INTO
    calculation_history (
        user_id,
        operation,
        operand_a,
        operand_b,
        expression,
        result
    )
VALUES
    (1, 'addition', 10, 5, '10 + 5', 15),
    (2, 'subtraction', 50, 20, '50 - 20', 30),
    (3, 'multiplication', 8, 7, '8 * 7', 56),
    (4, 'division', 100, 5, '100 / 5', 20),
    (5, 'power', 2, 5, '2 ^ 5', 32);