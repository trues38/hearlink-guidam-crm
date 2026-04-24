#!/bin/bash
set -e

echo "=== 00_env_check.sh - 환경 점검 ==="

# 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

error_count=0

echo -e "${YELLOW}[1/6] Node.js 버전 체크...${NC}"
NODE_VERSION=$(node -v)
REQUIRED_VERSION="v20.11.0"
if [[ "$NODE_VERSION" == "$REQUIRED_VERSION" ]]; then
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js: $NODE_VERSION (필요: $REQUIRED_VERSION)${NC}"
    error_count=$((error_count + 1))
fi

echo -e "${YELLOW}[2/6] npm 패키지 체크...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules 존재${NC}"
else
    echo -e "${RED}✗ node_modules 없음 - npm install 필요${NC}"
    error_count=$((error_count + 1))
fi

echo -e "${YELLOW}[3/6] Prisma 의존성 체크...${NC}"
if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓ Prisma Client 존재${NC}"
else
    echo -e "${RED}✗ Prisma Client 없음${NC}"
    error_count=$((error_count + 1))
fi

echo -e "${YELLOW}[4/6] Docker 컨테이너 체크...${NC}"
POSTGRES_RUNNING=$(docker ps --filter "name=postgres" --filter "status=running" -q 2>/dev/null)
REDIS_RUNNING=$(docker ps --filter "name=redis" --filter "status=running" -q 2>/dev/null)

if [ -n "$POSTGRES_RUNNING" ]; then
    echo -e "${GREEN}✓ PostgreSQL 실행 중${NC}"
else
    echo -e "${RED}✗ PostgreSQL 실행 안됨${NC}"
    error_count=$((error_count + 1))
fi

if [ -n "$REDIS_RUNNING" ]; then
    echo -e "${GREEN}✓ Redis 실행 중${NC}"
else
    echo -e "${YELLOW}⚠ Redis 실행 안됨 (선택사항)${NC}"
fi

echo -e "${YELLOW}[5/6] Database 접속 체크...${NC}"
if command -v psql &> /dev/null; then
    # .env 파일에서 접속정보 읽기
    if [ -f ".env" ]; then
        source .env
    fi
    DB_URL="${DATABASE_URL:-postgresql://hearldev:hearldev123@localhost:5433/hearldev}"
    
    if PGPASSWORD=hearldev123 psql -h localhost -p 5433 -U hearldev -d hearldev -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database 접속 성공${NC}"
    else
        echo -e "${RED}✗ Database 접속 실패${NC}"
        error_count=$((error_count + 1))
    fi
else
    echo -e "${YELLOW}⚠ psql CLI 없음 -.Skip${NC}"
fi

echo -e "${YELLOW}[6/6] Backend/Frontend 디렉토리 체크...${NC}"
if [ -d "server" ]; then
    echo -e "${GREEN}✓ server/ 디렉토리 존재${NC}"
else
    echo -e "${RED}✗ server/ 디렉토리 없음${NC}"
    error_count=$((error_count + 1))
fi

if [ -d "frontend" ]; then
    echo -e "${GREEN}✓ frontend/ 디렉토리 존재${NC}"
else
    echo -e "${RED}✗ frontend/ 디렉토리 없음${NC}"
    error_count=$((error_count + 1))
fi

echo ""
if [ $error_count -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 모든 환경 점검 통과!${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ $error_count 개의 오류가 발견됨${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi