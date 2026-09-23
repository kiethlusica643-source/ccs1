<?php
require_once __DIR__ . '/bootstrap.php';
$pdo=db(); $method=$_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    json_out(true, '', ['user'=>user(), 'csrf'=>csrf_token()]);
}
$data=body();

if (($_GET['action'] ?? '') === 'logout') {
    session_unset(); session_destroy(); json_out(true,'Signed out.');
}
require_csrf($data);

if (($_GET['action'] ?? '') === 'forgot') {
    $email=clean((string)($data['email']??''));
    if (!filter_var($email,FILTER_VALIDATE_EMAIL)) json_out(false,'Enter a valid email address.',[],422);
    $s=$pdo->prepare('SELECT id,full_name,email FROM users WHERE email=? AND is_active=1 LIMIT 1');
    $s->execute([$email]); $account=$s->fetch();
    if (!$account) json_out(false,'No active account was found for that email address.',[],404);
    if ($account) {
        $token=bin2hex(random_bytes(32));
        $s=$pdo->prepare('DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at < NOW()');
        $s->execute([$account['id']]);
        $s=$pdo->prepare('INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR))');
        $s->execute([$account['id'],hash('sha256',$token)]);
        $resetUrl='http://'.($_SERVER['HTTP_HOST']??'localhost').rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])),'/\\').'/index.php?reset='.urlencode($token);
        $subject='CCS Clearance System password reset';
        $message="Hello {$account['full_name']},\n\nOpen this link within one hour to reset your password:\n{$resetUrl}\n\nIf you did not request this, you can ignore this email.";
        @mail($account['email'],$subject,$message,'Content-Type: text/plain; charset=UTF-8');
        audit($pdo,(int)$account['id'],'request_password_reset');
    }
    json_out(true,'If that email belongs to an active account, password-reset instructions have been sent.');
}

if (($_GET['action'] ?? '') === 'reset') {
    $token=clean((string)($data['token']??'')); $password=(string)($data['password']??''); $confirm=(string)($data['confirm_password']??'');
    if ($token==='' || $password==='' || $confirm==='') json_out(false,'Complete all password-reset fields.',[],422);
    if ($password!==$confirm) json_out(false,'Passwords do not match.',[],422);
    if (strlen($password)<8) json_out(false,'Password must be at least 8 characters.',[],422);
    $s=$pdo->prepare('SELECT id,user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>NOW() LIMIT 1');
    $s->execute([hash('sha256',$token)]); $reset=$s->fetch();
    if (!$reset) json_out(false,'This password-reset link is invalid or has expired.',[],422);
    $s=$pdo->prepare('UPDATE users SET password_hash=? WHERE id=?'); $s->execute([password_hash($password,PASSWORD_DEFAULT),$reset['user_id']]);
    $s=$pdo->prepare('UPDATE password_reset_tokens SET used_at=NOW() WHERE id=?'); $s->execute([$reset['id']]);
    audit($pdo,(int)$reset['user_id'],'reset_password');
    json_out(true,'Password reset successfully. You can now sign in.');
}

if (($_GET['action'] ?? '') === 'login') {
    $identifier=clean((string)($data['identifier']??''));
    $password=(string)($data['password']??'');
    if ($identifier==='' || $password==='') json_out(false,'Enter your username/email/student number and password.',[],422);
    $s=$pdo->prepare("SELECT * FROM users WHERE (username=? OR email=? OR student_no=?) AND is_active=1 LIMIT 1");
    $s->execute([$identifier,$identifier,$identifier]); $u=$s->fetch();
    if (!$u || !password_verify($password,$u['password_hash'])) json_out(false,'Invalid credentials.',[],422);
    session_regenerate_id(true);
    $_SESSION['user']=[
        'id'=>(int)$u['id'],'username'=>$u['username'],'email'=>$u['email'],'student_no'=>$u['student_no'],
        'full_name'=>$u['full_name'],'role'=>$u['role'],'course'=>$u['course'],'year_level'=>$u['year_level'],
        'section'=>$u['section'],'contact_no'=>$u['contact_no'],'photo_url'=>$u['photo_url']
    ];
    csrf_token(); audit($pdo,(int)$u['id'],'login');
    json_out(true,'Welcome back.', ['user'=>$_SESSION['user'],'csrf'=>$_SESSION['csrf']]);
}

if (($_GET['action'] ?? '') === 'register') {
    $required=['first_name','middle_name','last_name','student_no','course','year_level','semester','section','email','contact_no','password','confirm_password'];
    foreach($required as $k) if (clean((string)($data[$k]??''))==='') json_out(false,"Missing field: $k",[],422);
    if (!filter_var($data['email'],FILTER_VALIDATE_EMAIL)) json_out(false,'Enter a valid email.',[],422);
    if ($data['password'] !== $data['confirm_password']) json_out(false,'Passwords do not match.',[],422);
    if (strlen($data['password']) < 8) json_out(false,'Password must be at least 8 characters.',[],422);
    $full=trim($data['first_name'].' '.($data['middle_name']??'').' '.$data['last_name']);
    try {
        $s=$pdo->prepare("INSERT INTO users(username,email,student_no,password_hash,full_name,role,course,year_level,section,semester,contact_no) VALUES(?,?,?,?,?,?,?,?,?,?,?)");
        $username=strtolower(preg_replace('/\s+/','.',trim($data['first_name'].'.'.$data['last_name'])));
        $s->execute([$username,$data['email'],$data['student_no'],password_hash($data['password'],PASSWORD_DEFAULT),$full,'student',$data['course'],$data['year_level'],$data['section'],$data['semester'],$data['contact_no']]);
        audit($pdo,(int)$pdo->lastInsertId(),'register');
        json_out(true,'Account created. You can now sign in.');
    } catch(PDOException $e) {
        if ((int)$e->errorInfo[1]===1062) json_out(false,'Student number, email, or username already exists.',[],422);
        throw $e;
    }
}
json_out(false,'Unknown authentication action.',[],400);
