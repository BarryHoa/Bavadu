-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    avatar TEXT,
    join_date DATE NOT NULL,
    salary DECIMAL(10,2),
    address TEXT,
    date_of_birth DATE,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert sample employees data
INSERT INTO employees (first_name, last_name, email, phone, position, department, status, avatar, join_date, salary, address, date_of_birth, emergency_contact, emergency_phone) VALUES
('John', 'Doe', 'john.doe@company.com', '+1-555-0101', 'Software Engineer', 'Engineering', 'active', 'https://i.pravatar.cc/150?u=john', '2023-01-15', 75000.00, '123 Main St, City, State', '1990-05-15', 'Jane Doe', '+1-555-0102'),
('Jane', 'Smith', 'jane.smith@company.com', '+1-555-0201', 'Product Manager', 'Product', 'active', 'https://i.pravatar.cc/150?u=jane', '2022-08-20', 95000.00, '456 Oak Ave, City, State', '1988-12-03', 'Bob Smith', '+1-555-0202'),
('Mike', 'Johnson', 'mike.johnson@company.com', '+1-555-0301', 'UX Designer', 'Design', 'on-leave', 'https://i.pravatar.cc/150?u=mike', '2023-03-10', 65000.00, '789 Pine St, City, State', '1992-07-22', 'Lisa Johnson', '+1-555-0302'),
('Sarah', 'Wilson', 'sarah.wilson@company.com', '+1-555-0401', 'HR Manager', 'Human Resources', 'active', 'https://i.pravatar.cc/150?u=sarah', '2021-11-05', 85000.00, '321 Elm St, City, State', '1985-03-18', 'Tom Wilson', '+1-555-0402'),
('David', 'Brown', 'david.brown@company.com', '+1-555-0501', 'DevOps Engineer', 'Engineering', 'active', 'https://i.pravatar.cc/150?u=david', '2023-06-12', 80000.00, '654 Maple Dr, City, State', '1991-09-14', 'Mary Brown', '+1-555-0502'),
('Emily', 'Davis', 'emily.davis@company.com', '+1-555-0601', 'Marketing Specialist', 'Marketing', 'active', 'https://i.pravatar.cc/150?u=emily', '2023-02-28', 60000.00, '987 Cedar Ln, City, State', '1993-11-08', 'Chris Davis', '+1-555-0602'),
('Robert', 'Miller', 'robert.miller@company.com', '+1-555-0701', 'Sales Director', 'Sales', 'active', 'https://i.pravatar.cc/150?u=robert', '2020-04-15', 110000.00, '147 Birch St, City, State', '1982-01-25', 'Susan Miller', '+1-555-0702'),
('Lisa', 'Garcia', 'lisa.garcia@company.com', '+1-555-0801', 'Financial Analyst', 'Finance', 'active', 'https://i.pravatar.cc/150?u=lisa', '2022-09-10', 70000.00, '258 Spruce Ave, City, State', '1987-06-12', 'Carlos Garcia', '+1-555-0802');
