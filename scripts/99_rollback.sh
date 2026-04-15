#!/bin/bash

echo "=== 99_rollback.sh - 롤백 스크립트 ==="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "[주의] 이 스크립트는 변경사항을 롤백합니다."
echo "        계속 진행하시겠습니까? (y/N)"
read confirm

if [ "$confirm" != "y" ]; then
    echo "롤백 취소됨"
    exit 0
fi

echo "[1/3] Git rollback..."
LAST_COMMIT=$(git rev-parse HEAD~1 2>/dev/null || echo "")
if [ -n "$LAST_COMMIT" ]; then
    git reset --hard HEAD~1
    echo "✓ Git 롤백 완료: $LAST_COMMIT"
else
    echo "⚠ 롤백할 커밋이 없음"
fi

echo "[2/3] Database 롤백 (선택사항)..."
echo "⚠ Database 롤백은 수동으로 진행하세요:"
echo "   npx prisma db push --force-reset"

echo "[3/3] 서비스 재시작..."
pkill -f "node server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo ""
echo "✓ 롤백 완료"
echo "다음: scripts/10_migrate.sh && npm run dev"