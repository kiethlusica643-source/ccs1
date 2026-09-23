<?php
require_once __DIR__ . '/bootstrap.php';
$pdo=db();$u=require_login();
if($_SERVER['REQUEST_METHOD']==='GET') json_out(true,'',['user'=>$u]);
$data=$_POST;require_csrf($data);
$full=clean((string)($data['full_name']??$u['full_name']));$email=clean((string)($data['email']??$u['email']));$contact=clean((string)($data['contact_no']??$u['contact_no']));
if(!filter_var($email,FILTER_VALIDATE_EMAIL)) json_out(false,'Enter a valid email.',[],422);
$photoUrl=$u['photo_url']??null;
if(isset($_FILES['photo']) && $_FILES['photo']['error']!==UPLOAD_ERR_NO_FILE){
    $photo=$_FILES['photo'];
    if($photo['error']!==UPLOAD_ERR_OK) json_out(false,'The profile photo upload failed.',[],422);
    if($photo['size']>5*1024*1024) json_out(false,'Profile photos must be 5 MB or smaller.',[],422);
    $finfo=new finfo(FILEINFO_MIME_TYPE);$mime=$finfo->file($photo['tmp_name']);
    $extensions=['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'];
    if(!isset($extensions[$mime]) || @getimagesize($photo['tmp_name'])===false) json_out(false,'Upload a valid JPG, PNG, GIF, or WebP image.',[],422);
    $uploadDir=__DIR__.'/../assets/uploads/profile';
    if(!is_dir($uploadDir) && !mkdir($uploadDir,0755,true)) json_out(false,'The profile upload folder could not be created.',[],500);
    $filename='user_'.$u['id'].'_'.bin2hex(random_bytes(8)).'.'.$extensions[$mime];
    if(!move_uploaded_file($photo['tmp_name'],$uploadDir.'/'.$filename)) json_out(false,'The profile photo could not be saved.',[],500);
    $photoUrl='assets/uploads/profile/'.$filename;
}
if(!empty($data['new_password'])){
    $s=$pdo->prepare("SELECT password_hash FROM users WHERE id=?");$s->execute([$u['id']]);$hash=$s->fetchColumn();
    if(!$hash || !password_verify((string)($data['current_password']??''),$hash)) json_out(false,'Current password is incorrect.',[],422);
    if(strlen($data['new_password'])<8) json_out(false,'New password must be at least 8 characters.',[],422);
    try{$s=$pdo->prepare("UPDATE users SET full_name=?,email=?,contact_no=?,password_hash=?,photo_url=? WHERE id=?");
        $s->execute([$full,$email,$contact,password_hash($data['new_password'],PASSWORD_DEFAULT),$photoUrl,$u['id']]);
    }catch(PDOException $e){if((int)$e->errorInfo[1]===1062) json_out(false,'That email address is already in use.',[],422);throw $e;}
}else{
    try{$s=$pdo->prepare("UPDATE users SET full_name=?,email=?,contact_no=?,photo_url=? WHERE id=?");$s->execute([$full,$email,$contact,$photoUrl,$u['id']]);
    }catch(PDOException $e){if((int)$e->errorInfo[1]===1062) json_out(false,'That email address is already in use.',[],422);throw $e;}
}
$_SESSION['user']['full_name']=$full;$_SESSION['user']['email']=$email;$_SESSION['user']['contact_no']=$contact;$_SESSION['user']['photo_url']=$photoUrl;
audit($pdo,$u['id'],'update_profile');
json_out(true,'Changes saved.',['user'=>$_SESSION['user']]);
