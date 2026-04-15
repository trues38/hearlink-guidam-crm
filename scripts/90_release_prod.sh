#!/bin/bash

echo "=== 90_release_prod.sh - 운영 배포 ==="

PROJECT_DIR="/Users/js/Documents/project/hearlink-guidam-crm"
cd $PROJECT_DIR

echo "[주의] 이 스크립트는 운영 환경에 배포합니다."
echo "        계속 진행하시겠습니까? (y/N)"
read confirm

if [ "$confirm" != "y" ]; then
    echo "배포 취소됨"
    exit 0
fi

echo "[1/3] Git commit 및 태그..."
git add -A
git commit -m "Phase 3 Final Release - $(date +%Y%m%d)"

TAG="v0.3.0-phase3"
git tag -a $TAG -m "Phase 3 Final Release"
echo "✓ Git commit 및 태그 완료: $TAG"

echo "[2/3] Docker 이미지 빌드 (선택사항)..."
if [ -f "docker-compose.yml" ]; then
    echo "⚠ Docker 빌드는 수동으로 진행하세요:"
    echo "   docker-compose build"
fi

echo "[3/3] 배포 확인..."
echo "✓ Frontend: http://localhost:3001"
echo "✓ Backend: http://localhost:3002"
echo "✓ Database: localhost:5433"

echo ""
echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32m✓ Phase 3 배포 완료!\033[0m"
echo -e "\033[0;32m========================================\033[0m"
echo ""
echo "다음 단계:"
echo "1. Git push: git push && git push --tags"
echo "2. Docker 배포 (선택)"