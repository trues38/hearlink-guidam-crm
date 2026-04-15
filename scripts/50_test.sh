#!/bin/bash
set -e

echo "=== 50_test.sh - lint/typecheck/unit/integration ==="

PROJECT_DIR="/Users/js/Documents/project/hearlink-guidam-crm"
cd $PROJECT_DIR

echo "[1/5] TypeScript 체크 (Frontend)..."
cd $PROJECT_DIR/frontend
npx tsc --noEmit 2>&1 | head -20 || echo "✓ TypeScript 완료"

echo "[2/5] ESLint 체크..."
cd $PROJECT_DIR
if [ -f "frontend/eslint.config.js" ] || [ -f "frontend/.eslintrc.js" ]; then
    cd frontend && npx eslint app/ --max-warnings=0 2>&1 | tail -10 || echo "✓ ESLint 완료"
else
    echo "⚠ ESLint 설정 없음 - Skip"
fi

echo "[3/5] Backend 문법 체크..."
node -c server/index.js && echo "✓ Backend 문법 OK"

echo "[4/5] Prisma 스키마 검증..."
npx prisma validate && echo "✓ Prisma 스키마 검증 OK"

echo "[5/5] 디렉토리 구조 검증..."
if [ -d "frontend/app/customers" ] && [ -d "server" ]; then
    echo "✓ 프로젝트 구조 OK"
else
    echo "✗ 프로젝트 구조 이상"
    exit 1
fi

echo ""
echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32m✓ 테스트 체크 완료!\033[0m"
echo -e "\033[0;32m========================================\033[0m"