<?php
require_once __DIR__ . '/bootstrap.php';
$pdo=db(); $u=require_roles(['lab','library','cashier','sds','adviser','program_head','dean','registrar']);
$map=['lab'=>'Laboratory/Shop','library'=>'Library','cashier'=>'Cashier','sds'=>'Student Development Services','adviser'=>'Class Adviser','program_head'=>'Program Head','dean'=>'Dean','registrar'=>'Registrar'];
$dept=$map[$u['role']];
$s=$pdo->prepare("SELECT id FROM departments WHERE name=?");$s->execute([$dept]);$deptId=(int)$s->fetchColumn();
if($_SERVER['REQUEST_METHOD']==='GET'){
    $s=$pdo->prepare("SELECT id,requirement_text,visibility,is_active FROM requirements WHERE department_id=? ORDER BY id");$s->execute([$deptId]);
    json_out(true,'',['department'=>$dept,'requirements'=>$s->fetchAll()]);
}
$data=body(); require_csrf($data); $action=$_GET['action']??'';
if($action==='save'){
    $id=(int)($data['id']??0);$text=clean((string)($data['requirement_text']??''));$vis=!empty($data['visibility'])?1:0;
    if($id && $text===''){
        $s=$pdo->prepare("UPDATE requirements SET visibility=? WHERE id=? AND department_id=?");$s->execute([$vis,$id,$deptId]);
        audit($pdo,$u['id'],'toggle_requirement',$dept); json_out(true,'Visibility updated.');
    }
    if($text==='') json_out(false,'Requirement text is required.',[],422);
    if($id){
        $s=$pdo->prepare("UPDATE requirements SET requirement_text=?,visibility=? WHERE id=? AND department_id=?");$s->execute([$text,$vis,$id,$deptId]);
    } else {
        $s=$pdo->prepare("INSERT INTO requirements(department_id,requirement_text,visibility) VALUES(?,?,?)");$s->execute([$deptId,$text,$vis]);
    }
    audit($pdo,$u['id'],'save_requirement',$dept.' / '.$text); json_out(true,'Requirement saved.');
}
if($action==='delete'){
    $id=(int)($data['id']??0);$s=$pdo->prepare("UPDATE requirements SET is_active=0 WHERE id=? AND department_id=?");$s->execute([$id,$deptId]);json_out(true,'Requirement removed.');
}
json_out(false,'Unknown requirement action.',[],400);
