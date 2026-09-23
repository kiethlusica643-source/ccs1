<?php
declare(strict_types=1);
session_start();
$logged = isset($_SESSION['user']);
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CCS Clearance System</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<div id="toast-root"></div>

<section id="auth-view" class="auth-shell <?= $logged ? 'hidden':'' ?>">
  <div class="auth-card">
    <div class="brand">
      <div class="brand-mark">URS</div>
      <div><strong>UNIVERSITY OF RIZAL SYSTEM</strong><small>BINANGONAN CAMPUS<br>CCS Clearance System</small></div>
    </div>
    <div id="login-panel">
      <h1>Welcome back</h1><p class="muted">Sign in to continue to your clearance dashboard.</p>
      <form id="login-form">
        <label>Username/Email/Student No.<input name="identifier" required autocomplete="username"></label>
        <label>Password<div class="password-field"><input name="password" type="password" required autocomplete="current-password"><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label>
        <div class="row between tiny"><label class="check"><input type="checkbox" name="remember"> Remember me</label><a href="#" id="forgot">Forgot Password?</a></div>
        <button class="btn primary wide">Sign In</button>
      </form>
      <div class="or">or</div><button class="btn ghost wide" id="show-register">Get Your Account</button>
      <div class="or">or</div><button class="link-btn" id="show-reset" type="button">Reset your password</button>
      <div class="demo-note">Demo: <b>chester@example.com</b> / <b>Password123!</b></div>
    </div>
    <div id="reset-panel" class="hidden">
      <h1>Reset Password</h1><p class="muted">Enter your email and we will send password-reset instructions.</p>
      <form id="forgot-form"><label>Email<input type="email" name="email" required autocomplete="email"></label><button class="btn primary wide">Send Reset Instructions</button></form>
      <form id="reset-password-form" class="hidden"><label>New Password<div class="password-field"><input name="password" type="password" minlength="8" required autocomplete="new-password"><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label><label>Confirm Password<div class="password-field"><input name="confirm_password" type="password" minlength="8" required autocomplete="new-password"><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label><button class="btn primary wide">Set New Password</button></form>
      <button class="link-btn" id="back-to-login" type="button">Back to sign in</button>
    </div>
    <div id="register-panel" class="hidden">
      <h1>Create Student Account</h1><p class="muted">Register your CCS student clearance account.</p>
      <form id="register-form" class="grid-form">
        <label>First Name<input name="first_name" required></label><label>Middle Name<input name="middle_name"></label><label>Last Name<input name="last_name" required></label>
        <label>Student No.<input name="student_no" required></label><label>Course<select name="course"><option>BSIT</option><option>BSIS</option></select></label><label>Year<select name="year_level"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
        <label>Semester<select name="semester"><option>1st</option><option>2nd</option></select></label><label>Section<input name="section" placeholder="BSIT 3-2A" required></label><label>Email<input type="email" name="email" required></label>
        <label>Contact No.<input name="contact_no" required></label><label>Password<div class="password-field"><input name="password" type="password" minlength="8" required><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label><label>Confirm Password<div class="password-field"><input name="confirm_password" type="password" minlength="8" required><button type="button" class="password-toggle" data-password-toggle aria-label="Show password">Show</button></div></label>
        <button class="btn primary wide span-3">Register</button>
      </form>
      <button class="link-btn" id="show-login">Already have an account? Sign in</button>
    </div>
  </div>
</section>

<section id="app-view" class="<?= $logged ? '' : 'hidden' ?>">
  <aside class="sidebar">
    <div class="side-brand"><div class="brand-mark small">URS</div><div><b>CCS Clearance</b><small>Student System</small></div></div>
    <div id="side-user" class="side-user"></div>
    <nav id="nav"></nav>
    <button class="logout" id="logout">⇥ Logout</button>
  </aside>
  <main class="main">
    <header class="topbar">
      <div class="mobile-title">CCS Clearance System</div>
      <div class="top-actions"><span id="term">AY 2025-2026</span><button class="avatar" id="avatar"></button></div>
    </header>
    <div id="page" class="page"></div>
  </main>
</section>

<div id="modal-root"></div>
<script src="js/main.js"></script>
</body>
</html>
