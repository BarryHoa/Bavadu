-- Drop existing employees table and recreate with new structure
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table with work-related fields only (personal info in users table)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Reference to users table
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    join_date DATE NOT NULL,
    salary DECIMAL(10,2),
    date_of_birth DATE,
    emergency_name VARCHAR(100),
    emergency_phone VARCHAR(20),
    
    -- Work-related multi-value fields as JSON arrays
    positions JSONB,
    roles JSONB,
    addresses JSONB,
    
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert sample data (assuming users table has corresponding records)
INSERT INTO employees (
    user_id, status, join_date, salary, date_of_birth, 
    emergency_name, emergency_phone, positions, roles, addresses
) VALUES
(
    1, 'active', '2023-01-15', 75000.00, '1990-05-15',
    'Jane Doe', '+1-555-0102',
    '[{"position": "Software Engineer", "department": "Engineering", "startDate": "2023-01-15", "isCurrent": true}]',
    '[{"roleId": 1, "startDate": "2023-01-15", "isActive": true}, {"roleId": 4, "startDate": "2023-06-01", "isActive": true}]',
    '[{"address": "123 Main St, City, State 12345", "type": "home", "isPrimary": true}, {"address": "456 Work Ave, City, State 12345", "type": "work", "isPrimary": false}]'
),
(
    2, 'active', '2022-08-20', 95000.00, '1988-12-03',
    'Bob Smith', '+1-555-0202',
    '[{"position": "Product Manager", "department": "Product", "startDate": "2022-08-20", "isCurrent": true}]',
    '[{"roleId": 5, "startDate": "2022-08-20", "isActive": true}, {"roleId": 7, "startDate": "2023-01-01", "isActive": true}]',
    '[{"address": "789 Oak St, City, State 12345", "type": "home", "isPrimary": true}]'
),
(
    3, 'on-leave', '2023-03-10', 65000.00, '1992-07-22',
    'Lisa Johnson', '+1-555-0302',
    '[{"position": "UX Designer", "department": "Design", "startDate": "2023-03-10", "isCurrent": true}]',
    '[{"roleId": 8, "startDate": "2023-03-10", "isActive": true}, {"roleId": 10, "startDate": "2023-05-01", "isActive": true}]',
    '[{"address": "321 Pine Ave, City, State 12345", "type": "home", "isPrimary": true}]'
),
(
    4, 'active', '2021-11-05', 85000.00, '1985-03-18',
    'Tom Wilson', '+1-555-0402',
    '[{"position": "HR Manager", "department": "Human Resources", "startDate": "2021-11-05", "isCurrent": true}]',
    '[{"roleId": 11, "startDate": "2021-11-05", "isActive": true}, {"roleId": 12, "startDate": "2022-01-01", "isActive": true}]',
    '[{"address": "654 Elm St, City, State 12345", "type": "home", "isPrimary": true}]'
),
(
    5, 'active', '2023-06-12', 80000.00, '1991-09-14',
    'Mary Brown', '+1-555-0502',
    '[{"position": "DevOps Engineer", "department": "Engineering", "startDate": "2023-06-12", "isCurrent": true}]',
    '[{"roleId": 13, "startDate": "2023-06-12", "isActive": true}, {"roleId": 14, "startDate": "2023-08-01", "isActive": true}]',
    '[{"address": "987 Maple Dr, City, State 12345", "type": "home", "isPrimary": true}]'
);
