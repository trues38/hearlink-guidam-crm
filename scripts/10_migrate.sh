#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== 10_migrate.sh - 스키마 마이그레이션 ==="

cd "$PROJECT_DIR"

echo "[1/3] Prisma 스키마 검증..."
npx prisma validate
echo "✓ 스키마 검증 완료"

echo "[2/3] Database push (개발용 - 테스트 서버)..."
npx prisma db push --skip-generate
echo "✓ Database push 완료"

echo "[3/3] Prisma Client 생성..."
npx prisma generate
echo "✓ Prisma Client 생성 완료"

echo ""
echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32m✓ 마이그레이션 완료!\033[0m"
echo -e "\033[0;32m========================================\033[0m"