-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');


-- ========================================
-- Service Project Table
-- ========================================
CREATE TABLE service_project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization(organization_id)
);


-- ========================================
-- Insert sample service projects
-- ========================================
INSERT INTO service_project (organization_id, title, description, location, date)
VALUES
(1, 'Community Playground Renovation', 'Repair and improve playground equipment for local children.', 'Zurich', '2026-11-14'),
(1, 'Neighborhood Home Repairs', 'Help families with essential home maintenance and repairs.', 'Basel', '2026-11-21'),
(1, 'Community Center Painting', 'Refresh a community center with new paint and minor repairs.', 'Aarau', '2026-12-05'),
(1, 'Accessible Ramp Construction', 'Build accessibility ramps for community buildings.', 'Lenzburg', '2026-12-12'),
(1, 'Public Park Bench Restoration', 'Restore damaged benches in public parks.', 'Lucerne', '2027-01-09'),

(2, 'Urban Garden Planting', 'Plant vegetables and herbs in a community garden.', 'Zurich', '2026-11-15'),
(2, 'Food Sustainability Workshop', 'Teach residents about sustainable food production.', 'Basel', '2026-11-28'),
(2, 'Community Composting Day', 'Set up composting systems for local households.', 'Aarau', '2026-12-06'),
(2, 'School Garden Project', 'Help students establish a school vegetable garden.', 'Lenzburg', '2027-03-13'),
(2, 'Neighborhood Seed Exchange', 'Organize a seed exchange for local gardeners.', 'Winterthur', '2027-03-20'),

(3, 'Winter Clothing Drive', 'Collect and distribute warm clothing to families in need.', 'Zurich', '2026-11-18'),
(3, 'Food Bank Volunteer Day', 'Sort and distribute food donations to local residents.', 'Basel', '2026-11-25'),
(3, 'Senior Community Visit', 'Spend time with seniors and assist with daily activities.', 'Aarau', '2026-12-10'),
(3, 'Holiday Gift Collection', 'Collect holiday gifts for children in need.', 'Lenzburg', '2026-12-17'),
(3, 'Community Cleanup Event', 'Organize volunteers to clean public spaces.', 'Lucerne', '2027-01-16');
