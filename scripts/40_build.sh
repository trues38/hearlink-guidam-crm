#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== 40_build.sh - 백엔드/프론트 빌드 ==="

cd "$PROJECT_DIR"

echo "[1/4] Backend 의존성 설치..."
cd $PROJECT_DIR
if [ -f "package.json" ]; then
    npm install --silent 2>/dev/null || npm install
    echo "✓ Backend 의존성 완료"
else
    echo "✗ package.json 없음"
    exit 1
fi

echo "[2/4] Prisma generate..."
npx prisma generate --quiet
echo "✓ Prisma generate 완료"

echo "[3/4] Frontend 빌드..."
cd $PROJECT_DIR/frontend
npm install --silent 2>/dev/null || npm install
npm run build 2>&1 | tail -20
echo "✓ Frontend 빌드 완료"

echo "[4/4] Backend 빌드 체크..."
cd $PROJECT_DIR
node -c server/index.js 2>/dev/null && echo "✓ Backend 문법 체크 완료"

echo ""
echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32m✓ 빌드 완료!\033[0m"
echo -e "\033[0;32m========================================\033[0m"