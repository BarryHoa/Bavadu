-- Create permissions table
CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert predefined permissions
INSERT INTO permissions (id, name, description, category) VALUES
-- Basic permissions
('read', 'Read access to resources', 'basic'),
('write', 'Write access to resources', 'basic'),
('delete', 'Delete access to resources', 'basic'),
('create', 'Create new resources', 'basic'),

-- Administrative permissions
('admin', 'Full administrative access', 'admin'),
('manage_users', 'Manage user accounts', 'admin'),
('manage_roles', 'Manage roles and permissions', 'admin'),
('system_config', 'Configure system settings', 'admin'),

-- Development permissions
('deploy', 'Deploy applications', 'development'),
('code_review', 'Review code changes', 'development'),
('merge', 'Merge code changes', 'development'),
('build', 'Build applications', 'development'),

-- Security permissions
('security', 'Security-related access', 'security'),
('audit', 'Audit system activities', 'security'),
('compliance', 'Compliance management', 'security'),
('encrypt', 'Encrypt sensitive data', 'security'),

-- Management permissions
('approve', 'Approve requests and changes', 'management'),
('lead', 'Lead team activities', 'management'),
('mentor', 'Mentor other employees', 'management'),
('facilitate', 'Facilitate meetings and processes', 'management'),

-- HR permissions
('recruit', 'Recruit new employees', 'hr'),
('interview', 'Conduct interviews', 'hr'),
('onboard', 'Onboard new employees', 'hr'),
('offboard', 'Offboard employees', 'hr'),

-- Design permissions
('design', 'Create designs and prototypes', 'design'),
('prototype', 'Create interactive prototypes', 'design'),
('research', 'Conduct user research', 'design'),
('analyze', 'Analyze user data', 'design'),

-- Project permissions
('plan', 'Plan projects and timelines', 'project'),
('track', 'Track project progress', 'project'),
('report', 'Generate reports', 'project'),
('budget', 'Manage project budgets', 'project');
