-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);


-- Insert predefined roles with permission string IDs (assuming permissions table exists)
INSERT INTO roles (name, description, department, permissions) VALUES
('Software Engineer', 'Develops and maintains software applications', 'Engineering', '["read", "write", "deploy"]'),
('Senior Software Engineer', 'Senior level software development with mentoring responsibilities', 'Engineering', '["read", "write", "deploy", "code_review", "mentor"]'),
('Lead Developer', 'Technical leadership role for development teams', 'Engineering', '["read", "write", "deploy", "code_review", "merge", "lead", "mentor"]'),
('Code Reviewer', 'Reviews code for quality and standards compliance', 'Engineering', '["read", "code_review"]'),
('Product Manager', 'Manages product development and strategy', 'Product', '["read", "write", "approve", "plan", "track"]'),
('Product Owner', 'Owns product backlog and requirements', 'Product', '["read", "write", "approve"]'),
('Scrum Master', 'Facilitates agile development processes', 'Product', '["read", "facilitate"]'),
('UX Designer', 'Designs user experience and interfaces', 'Design', '["read", "design", "prototype", "research"]'),
('UI Designer', 'Creates user interface designs', 'Design', '["read", "design", "prototype"]'),
('User Researcher', 'Conducts user research and usability studies', 'Design', '["read", "research", "analyze"]'),
('HR Manager', 'Manages human resources operations', 'Human Resources', '["read", "write", "admin", "manage_users", "manage_roles", "approve"]'),
('Recruiter', 'Recruits and hires new employees', 'Human Resources', '["read", "recruit", "interview"]'),
('DevOps Engineer', 'Manages infrastructure and deployment', 'Engineering', '["read", "write", "deploy", "build", "admin"]'),
('Security Officer', 'Ensures security compliance and practices', 'Engineering', '["read", "security", "audit", "compliance"]'),
('Project Manager', 'Manages project timelines and resources', 'Management', '["read", "write", "approve", "plan", "track", "report", "budget"]'),
('Team Lead', 'Leads and manages team members', 'Management', '["read", "write", "lead", "mentor"]');
