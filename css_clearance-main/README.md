# CCS Student Clearance System

A browser-based University of Rizal System CCS clearance prototype built with PHP 8+, MySQL/MariaDB, HTML5, CSS3 and vanilla JavaScript. The interface is based on the supplied 28 UI wireframes.

## Included
- Student sign-in and registration
- Student dashboard with 8-office progress
- Clearance Status and visible requirement checklist
- Printable clearance / browser Save as PDF when all offices are cleared
- Office dashboards for Laboratory/Shop, Library, Cashier, Student Development Services, Class Adviser, Program Head, Dean and Registrar
- Section clearance with Clear All and Exclude Selected
- Requirement Settings with add/edit/delete and student visibility
- Account settings and password change
- Profile photo upload with preview and confirmation before saving
- Secure password reset tokens with one-hour expiry
- PDO prepared statements, sessions, CSRF token and role authorization
- MySQL schema with foreign keys, seed data and audit log

## Demo
All seeded accounts use:
- Password: `Password123!`
- Student: `chester@example.com` or `2023-00145`
- Lab: `von@example.com`
- Library: `jaypee@example.com`
- Cashier: `denise@example.com`
- Student Development Services: `evelyn@example.com`
- Class Adviser: `yves@example.com`
- Program Head: `richelle@example.com`
- Dean: `joy@example.com`
- Registrar: `lorelie@example.com`

## XAMPP setup
1. Install XAMPP with Apache, PHP and MySQL/MariaDB.
2. Copy the project folder into `C:\xampp\htdocs\CCS_Clearance_System`.
3. Start Apache and MySQL in the XAMPP Control Panel.
4. Open phpMyAdmin at `http://localhost/phpmyadmin`.
5. Import `database.sql`.
6. Check `config/db_config.php`. Default XAMPP values are host `127.0.0.1`, user `root`, blank password.
7. Open `http://localhost/CCS_Clearance_System/` in Chrome.

## Profile photos and password reset
Profile photos are validated as JPG, PNG, GIF or WebP files up to 5 MB and are stored in `assets/uploads/profile/`. The folder is created automatically by the settings endpoint when the first photo is saved.

Password reset requests use PHP's built-in `mail()` function and one-hour database tokens. For local XAMPP testing, configure the `[mail function]` section in `C:\xampp\php\php.ini` with an SMTP server, then restart Apache. No Node.js package or additional PHP library is required.

## If MySQL has a password
Change only `DB_USER` and `DB_PASS` in `config/db_config.php`.

## Live hosting
1. Create a MySQL database and database user in cPanel.
2. Import `database.sql` into that database. If the host does not allow `CREATE DATABASE`, remove the first two lines and select the created database before importing.
3. Upload the project files to `public_html` (or a subfolder).
4. Set the database host/name/user/password in `config/db_config.php`.
5. Use PHP 8.1+ and enable PDO MySQL.
6. Point the domain/subdomain document root to the project directory.
7. Enable HTTPS and use a production database password.
8. Before public launch, add rate limiting, email-based password reset, secure photo uploads, stronger account administration and environment variables for secrets.

## Architecture
`index.php` is the browser shell/router. `dashboard.php` is a compatibility entry point. PHP JSON endpoints live in `api/`; database connection is in `config/`; CSS and JS are in their own directories.

The wireframe PNGs are intentionally not used as the application UI. They were used as visual references so the final interface remains real HTML controls and is interactive.
