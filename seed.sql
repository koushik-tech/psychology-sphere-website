-- Psychology Sphere Seed Data
-- Run this query in your Supabase SQL Editor to populate the initial courses, notices, and recorded lectures.

-- 1. Populate Courses (Faculty ID set to NULL initially; can be updated after user registration)
INSERT INTO public.courses (title, description, duration, fees, faculty_id) VALUES
('Introduction to Psychology', 'Explore the foundational principles of human behavior, cognitive science, emotions, and research methods.', '3 Months', 499, NULL),
('Clinical Psychology & Counseling', 'Advanced training in psychiatric diagnostics, clinical therapeutic methods, and practical counseling designs.', '6 Months', 899, NULL),
('Child & Adolescent Development', 'Analyze behavioral psychology, neurological development, and family dynamics from infancy to adolescence.', '4 Months', 599, NULL),
('Cognitive Neuropsychology', 'Delve into brain-behavior relationships, memory architectures, executive functions, and neural mapping.', '5 Months', 749, NULL),
('Research Methodologies & Statistics', 'Master quantitative/qualitative analysis, research setups, SPSS operations, and journal thesis structures.', '3 Months', 399, NULL);

-- 2. Populate Notices
INSERT INTO public.notices (title, content, target_role) VALUES
('Welcome to Psychology Sphere!', 'The competitive portals are now live. Clear your pending invoices to access syllabus content.', 'all'),
('Upcoming Live Masterclass', 'Join Dr. Jenkins this Sunday at 11:00 AM for a live broadcast on Cognitive Behavior Therapy.', 'all'),
('Fee Clearance Deadline', 'Monthly tuition installments must be completed by the 15th to maintain active classroom access.', 'student'),
('Syllabus Update Notice', 'Faculty members are requested to log the weekly attendance matrices by Friday evening.', 'faculty');

-- 3. Populate Recorded Sessions (Demo Videos)
-- Note: These use sample video links for demo display
INSERT INTO public.recorded_sessions (course_id, title, description, video_url) VALUES
(1, 'History and Evolution of Modern Psychology', 'Timeline review of psychological milestones from psychoanalysis to modern neurosciences.', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(2, 'DSM-5 Classification Criteria & Case History Taking', 'Step-by-step tutorial on taking diagnostic case files and matching patient parameters.', 'https://www.w3schools.com/html/mov_bbb.mp4');
