CREATE DATABASE IF NOT EXISTS ccs_clearance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ccs_clearance;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS clearances;
DROP TABLE IF EXISTS requirements;
DROP TABLE IF EXISTS office_assignments;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(80) NOT NULL UNIQUE,
 email VARCHAR(190) NOT NULL UNIQUE,
 student_no VARCHAR(50) NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 full_name VARCHAR(190) NOT NULL,
 role ENUM('student','lab','library','cashier','sds','adviser','program_head','dean','registrar') NOT NULL DEFAULT 'student',
 course VARCHAR(80) NULL,
 year_level VARCHAR(30) NULL,
 section VARCHAR(50) NULL,
 semester VARCHAR(30) NULL,
 contact_no VARCHAR(40) NULL,
 photo_url VARCHAR(255) NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE departments (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE,
 sort_order TINYINT UNSIGNED NOT NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE office_assignments (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 department_id INT UNSIGNED NOT NULL,
 user_id INT UNSIGNED NOT NULL,
 course VARCHAR(80) NOT NULL,
 UNIQUE KEY uq_assignment(department_id,course),
 FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE requirements (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 department_id INT UNSIGNED NOT NULL,
 requirement_text VARCHAR(255) NOT NULL,
 visibility TINYINT(1) NOT NULL DEFAULT 1,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clearances (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 student_id INT UNSIGNED NOT NULL,
 department_id INT UNSIGNED NOT NULL,
 status ENUM('pending','cleared') NOT NULL DEFAULT 'pending',
 cleared_at DATETIME NULL,
 remarks VARCHAR(255) NULL,
 updated_by INT UNSIGNED NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_clearance(student_id,department_id),
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
 FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NULL,
 action VARCHAR(100) NOT NULL,
 details TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE,
 expires_at DATETIME NOT NULL,
 used_at DATETIME NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX idx_reset_user(user_id),
 INDEX idx_reset_expiry(expires_at)
) ENGINE=InnoDB;

INSERT INTO departments(name,sort_order) VALUES
('Laboratory/Shop',1),('Library',2),('Cashier',3),('Student Development Services',4),
('Class Adviser',5),('Program Head',6),('Dean',7),('Registrar',8);

-- Password for every demo account: Password123!
INSERT INTO users(username,email,student_no,password_hash,full_name,role,course,year_level,section,semester,contact_no) VALUES
('chester.manalo','chester@example.com','2023-00145', '$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi', 'Chester R. Manalo','student','BSIT','3','BSIT 3-2A','1st','09170000001'),
('von.tumaliuan','von@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Von G. Tumaliuan','lab','BSIT',NULL,NULL,NULL,'09170000002'),
('jaypee.ramasasa','jaypee@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Jaypee A. Ramasasa, RL','library','BSIT',NULL,NULL,NULL,'09170000003'),
('denise.lopez','denise@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Denise An C. Lopez','cashier','BSIT',NULL,NULL,NULL,'09170000004'),
('evelyn.diaz','evelyn@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Evelyn V. Diaz, MM','sds','BSIT',NULL,NULL,NULL,'09170000005'),
('yves.candelaria','yves@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Yves Xavier S. Candelaria, Ph D','adviser','BSIT',NULL,NULL,NULL,'09170000006'),
('richelle.go','richelle@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Richelle E. Go, Ph.D. (Cand.)','program_head','BSIT',NULL,NULL,NULL,'09170000007'),
('joy.cruz','joy@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Joy D.G. Cruz, Ph D','dean','BSIT',NULL,NULL,NULL,'09170000008'),
('lorelie.anthony','lorelie@example.com',NULL,'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Lorelie G. Anthony','registrar','BSIT',NULL,NULL,NULL,'09170000009');

INSERT INTO office_assignments(department_id,user_id,course)
SELECT d.id,u.id,'BSIT' FROM departments d JOIN users u ON u.role=CASE d.name
 WHEN 'Laboratory/Shop' THEN 'lab' WHEN 'Library' THEN 'library' WHEN 'Cashier' THEN 'cashier'
 WHEN 'Student Development Services' THEN 'sds' WHEN 'Class Adviser' THEN 'adviser'
 WHEN 'Program Head' THEN 'program_head' WHEN 'Dean' THEN 'dean' WHEN 'Registrar' THEN 'registrar' END;

INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Equipment returned in good condition',1 FROM departments WHERE name='Laboratory/Shop';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'No unpaid breakage/loss fee',1 FROM departments WHERE name='Laboratory/Shop';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'No borrowed books outstanding',1 FROM departments WHERE name='Library';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Library ID Validation',1 FROM departments WHERE name='Library';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Email of Online Library Clearance Form',1 FROM departments WHERE name='Library';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'No outstanding tuition/fee balance',1 FROM departments WHERE name='Cashier';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Student org accountabilities cleared',1 FROM departments WHERE name='Cashier';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Guidance/Scholarship requirements settled',1 FROM departments WHERE name='Cashier';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'No outstanding tuition/fee balance',1 FROM departments WHERE name='Student Development Services';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Student org accountabilities cleared',1 FROM departments WHERE name='Student Development Services';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Guidance/Scholarship requirements settled',1 FROM departments WHERE name='Student Development Services';

INSERT INTO users(username,email,student_no,password_hash,full_name,role,course,year_level,section,semester,contact_no) VALUES
('ana.reyes','ana@example.com','2023-00146','$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Reyes, Ana P.','student','BSIT','3','BSIT 3-2A','1st','09170000010'),
('mark.santos','mark@example.com','2023-00147','$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi','Santos, Mark L.','student','BSIT','3','BSIT 3-2A','1st','09170000011');

INSERT INTO clearances(student_id,department_id,status,remarks)
SELECT u.id,d.id, CASE WHEN u.student_no='2023-00146' THEN 'pending' ELSE 'cleared' END,
 CASE WHEN u.student_no='2023-00146' THEN 'Unreturned Item.' ELSE NULL END
FROM users u CROSS JOIN departments d WHERE u.role='student';

INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'No outstanding class requirements',1 FROM departments WHERE name='Class Adviser';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Advisory records and section accountabilities cleared',1 FROM departments WHERE name='Class Adviser';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'Program-level academic requirements settled',1 FROM departments WHERE name='Program Head';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'College academic requirements settled',1 FROM departments WHERE name='Dean';
INSERT INTO requirements(department_id,requirement_text,visibility)
SELECT id,'University clearance records complete',1 FROM departments WHERE name='Registrar';

-- Extra sample students to make dashboard counts/sections useful.
INSERT INTO users(username,email,student_no,password_hash,full_name,role,course,year_level,section,semester)
SELECT CONCAT('sample',n),CONCAT('sample',n,'@example.com'),CONCAT('2023-00',150+n),
'$2y$12$T13FF/Kdg65eglxgZLMugeA8XsRHS1oLk.3VfDuJ78H/WB9KRLhVi',
CONCAT('Sample Student ',n),'student','BSIT','3',IF(n<=36,'BSIT 3-2A','BSIT 3-3A'),'1st'
FROM (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) x;

INSERT INTO clearances(student_id,department_id,status)
SELECT u.id,d.id,IF(u.student_no='2023-00145' OR u.student_no='2023-00147','cleared','pending')
FROM users u CROSS JOIN departments d WHERE u.role='student' AND NOT EXISTS
(SELECT 1 FROM clearances c WHERE c.student_id=u.id AND c.department_id=d.id);

SET FOREIGN_KEY_CHECKS=1;
