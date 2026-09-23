<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db_config.php';

function json_out(bool $ok, string $message = '', array $data = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(['ok'=>$ok,'message'=>$message,'data'=>$data], JSON_UNESCAPED_UNICODE);
    exit;
}
function body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function require_csrf(array $data): void {
    if (!hash_equals((string)($_SESSION['csrf'] ?? ''), (string)($data['csrf'] ?? ''))) {
        json_out(false, 'Invalid security token. Refresh and try again.', [], 419);
    }
}
function user(): ?array { return $_SESSION['user'] ?? null; }
function require_login(): array {
    $u = user();
    if (!$u) json_out(false, 'Please sign in first.', [], 401);
    return $u;
}
function require_roles(array $roles): array {
    $u = require_login();
    if (!in_array($u['role'], $roles, true)) json_out(false, 'You do not have permission for this action.', [], 403);
    return $u;
}
function clean(string $v): string { return trim($v); }
function audit(PDO $pdo, ?int $uid, string $action, string $details=''): void {
    $s=$pdo->prepare("INSERT INTO audit_logs(user_id,action,details) VALUES(?,?,?)");
    $s->execute([$uid,$action,$details]);
}
