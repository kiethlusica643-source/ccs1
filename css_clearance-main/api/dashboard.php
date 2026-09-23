<?php
require_once __DIR__ . '/bootstrap.php';
$pdo=db(); $u=require_login(); $action=$_GET['action']??'summary';

if($action==='summary'){
    if($u['role']==='student'){
        $s=$pdo->prepare("SELECT d.name department, u.full_name officer, c.status, c.cleared_at, c.remarks
                          FROM departments d
                          LEFT JOIN office_assignments oa ON oa.department_id=d.id AND oa.course=?
                          LEFT JOIN users u ON u.id=oa.user_id
                          LEFT JOIN clearances c ON c.student_id=? AND c.department_id=d.id
                          WHERE d.is_active=1 ORDER BY d.sort_order");
        $s->execute([$u['course'], $u['id']]); $rows=$s->fetchAll();
        $cleared=count(array_filter($rows,fn($r)=>$r['status']==='cleared'));
        json_out(true,'',['role'=>'student','departments'=>$rows,'cleared'=>$cleared,'total'=>count($rows),'printable'=>$cleared===8]);
    }
    $role=$u['role'];
    if($role==='registrar'){
        $rows=$pdo->query("SELECT d.name department,u.full_name officer,oa.course FROM office_assignments oa JOIN departments d ON d.id=oa.department_id JOIN users u ON u.id=oa.user_id ORDER BY d.sort_order")->fetchAll();
        json_out(true,'',['role'=>'registrar','assignments'=>$rows]);
    }
    $deptMap=['lab'=>'Laboratory/Shop','library'=>'Library','cashier'=>'Cashier','sds'=>'Student Development Services','adviser'=>'Class Adviser','program_head'=>'Program Head','dean'=>'Dean','registrar'=>'Registrar'];
    $dept=$deptMap[$role]??'';
    $s=$pdo->prepare("SELECT id FROM departments WHERE name=?"); $s->execute([$dept]); $deptId=(int)$s->fetchColumn();
    $s=$pdo->prepare("SELECT COUNT(DISTINCT u.id) assigned,
       SUM(CASE WHEN c.status='cleared' THEN 1 ELSE 0 END) cleared,
       SUM(CASE WHEN COALESCE(c.status,'pending')<>'cleared' THEN 1 ELSE 0 END) pending
       FROM users u JOIN clearances c ON c.student_id=u.id AND c.department_id=? WHERE u.role='student' AND u.course=?");
    $s->execute([$deptId,$u['course']]); $counts=$s->fetch() ?: ['assigned'=>0,'cleared'=>0,'pending'=>0];
    $s=$pdo->prepare("SELECT section,course,COUNT(*) total,
       SUM(CASE WHEN c.status='cleared' THEN 1 ELSE 0 END) cleared,
       SUM(CASE WHEN COALESCE(c.status,'pending')<>'cleared' THEN 1 ELSE 0 END) pending
       FROM users u JOIN clearances c ON c.student_id=u.id AND c.department_id=?
       WHERE u.role='student' AND u.course=? GROUP BY section,course ORDER BY section");
    $s->execute([$deptId,$u['course']]); $sections=$s->fetchAll();
    json_out(true,'',['role'=>$role,'department'=>$dept,'counts'=>$counts,'sections'=>$sections]);
}
json_out(false,'Unknown dashboard action.',[],400);
