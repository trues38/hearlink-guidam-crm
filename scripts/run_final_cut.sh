#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Hearlink Guidam CRM - Phase 3 Final Cut           ║"
echo "║                    Orchestrator                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/Users/js/Documents/project/hearlink-guidam-crm"
cd $PROJECT_DIR

FAILED=0

# 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

run_step() {
    local name=$1
    local script=$2
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}► 실행: $name${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ -f "$script" ]; then
        chmod +x $script 2>/dev/null || true
        bash $script
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $name 완료${NC}"
        else
            echo -e "${RED}✗ $name 실패${NC}"
            FAILED=1
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ $script 없음 - Skip${NC}"
    fi
}

echo ""
echo "Step 1: 환경 점검"
run_step "00_env_check" "$PROJECT_DIR/scripts/00_env_check.sh"
[ $FAILED -eq 1 ] && echo "중단됨" && exit 1

echo ""
echo "Step 2: 마이그레이션"
run_step "10_migrate" "$PROJECT_DIR/scripts/10_migrate.sh"
[ $FAILED -eq 1 ] && echo "중단됨" && exit 1

echo ""
echo "Step 3: 마스터 데이터 시드"
run_step "20_seed_master" "$PROJECT_DIR/scripts/20_seed_master.py"
[ $FAILED -eq 1 ] && echo "중단됨" && exit 1

echo ""
echo "Step 4: 기존 데이터 백필 (TODO - Phase 5에서 구현)"
run_step "30_backfill_status" "$PROJECT_DIR/scripts/30_backfill_status.py"

echo ""
echo "Step 5: 병렬 빌드 + 테스트 준비"
echo -e "${YELLOW}► 40_build + 50_test 병렬 실행${NC}"

# Build and test in parallel (if both exist)
if [ -f "$PROJECT_DIR/scripts/40_build.sh" ] && [ -f "$PROJECT_DIR/scripts/50_test.sh" ]; then
    chmod +x $PROJECT_DIR/scripts/40_build.sh $PROJECT_DIR/scripts/50_test.sh 2>/dev/null || true
    
    # Run build in background
    bash $PROJECT_DIR/scripts/40_build.sh > /tmp/build.log 2>&1 &
    BUILD_PID=$!
    
    # Wait for build
    wait $BUILD_PID
    BUILD_RESULT=$?
    
    if [ $BUILD_RESULT -eq 0 ]; then
        echo -e "${GREEN}✓ 40_build 완료${NC}"
    else
        echo -e "${RED}✗ 40_build 실패${NC}"
        cat /tmp/build.log
        FAILED=1
    fi
    
    # Now run tests
    if [ $FAILED -eq 0 ]; then
        run_step "50_test" "$PROJECT_DIR/scripts/50_test.sh"
    fi
else
    echo -e "${YELLOW}⚠ 빌드/테스트 스크립트 없음 - Skip${NC}"
fi

[ $FAILED -eq 1 ] && echo "중단됨" && exit 1

echo ""
echo "Step 6: E2E 시나리오 검증"
run_step "60_e2e_smoke" "$PROJECT_DIR/scripts/60_e2e_smoke.sh"
[ $FAILED -eq 1 ] && echo "중단됨" && exit 1

echo ""
echo "Step 7: QC 패acks 생성"
run_step "70_generate_qc_pack" "$PROJECT_DIR/scripts/70_generate_qc_pack.py"

echo ""
echo "Step 8: Release Candidate (승인 필요)"
echo -e "${YELLOW}⚠ 수동 승인 필요${NC}"
echo "     bash $PROJECT_DIR/scripts/80_release_candidate.sh"

echo ""
echo "Step 9: 운영 배포 (승인 필요)"
echo -e "${YELLOW}⚠ 수동 승인 필요${NC}"
echo "     bash $PROJECT_DIR/scripts/90_release_prod.sh"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Phase 3 Pipeline 완료!                         ║${NC}"
    echo -e "${GREEN}║  이제 실제 구현(Phase 2-8)을 진행할 수 있습니다.            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           Pipeline 실패 - 수정 필요                       ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi