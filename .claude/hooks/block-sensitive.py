"""
Claude Code PreToolUse Hook — 민감 파일 접근 차단
exit(2) 반환 시 해당 tool call을 block합니다.
"""

import sys
import json

# 차단할 파일명 패턴
SENSITIVE_PATTERNS = [
    "credentials",
    ".aws/config",
    "id_rsa",
    "id_ed25519",
    "id_ecdsa",
    ".pem",
    ".key",
    ".env",
    ".p12",
    ".pfx",
]

# 차단할 Bash 명령어 패턴
SENSITIVE_CMD_PATTERNS = [
    "~/.aws",
    ".aws/credentials",
    ".aws/config",
    "id_rsa",
    "id_ed25519",
]

def is_sensitive_path(path: str) -> bool:
    path_lower = path.lower().replace("\\", "/")
    # .env.local은 환경변수 파일이므로 차단 (단, 읽기 전용 예외 없음)
    return any(pattern.lower() in path_lower for pattern in SENSITIVE_PATTERNS)

def is_sensitive_command(command: str) -> bool:
    return any(pattern.lower() in command.lower() for pattern in SENSITIVE_CMD_PATTERNS)

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})

    if tool_name in ("Read", "Edit", "Write", "Glob", "MultiEdit"):
        path = tool_input.get("file_path") or tool_input.get("path") or ""
        if path and is_sensitive_path(path):
            print(f"[BLOCKED] 민감 파일 접근 차단: {path}", file=sys.stderr)
            print("이 파일은 보안 정책상 Claude가 접근할 수 없습니다.", file=sys.stderr)
            sys.exit(2)

    if tool_name == "Bash":
        command = tool_input.get("command") or ""
        if is_sensitive_command(command):
            print(f"[BLOCKED] 민감 경로가 포함된 명령어 차단: {command}", file=sys.stderr)
            print("이 명령어는 보안 정책상 Claude가 실행할 수 없습니다.", file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    main()
