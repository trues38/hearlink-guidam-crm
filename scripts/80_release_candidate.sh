#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== 80_release_candidate.sh - RC 패키징/태깅 ==="

cd "$PROJECT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RC_DIR="$PROJECT_DIR/release_candidates/rc_${TIMESTAMP}"
mkdir -p $RC_DIR

echo "[1/4] 프로젝트 파일 복사..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='private' $PROJECT_DIR/ $RC_DIR/project/ > /dev/null 2>&1

echo "[2/4] QC 패acks 복사..."
if [ -d "$PROJECT_DIR/qc_packs" ]; then
    cp -r $PROJECT_DIR/qc_packs $RC_DIR/
fi

echo "[3/4] DB 스키마 추출..."
npx prisma db pull --schema=$PROJECT_DIR/prisma/schema.prisma > /dev/null 2>&1 || true

echo "[4/4] Release notes 생성..."
cat > $RC_DIR/RELEASE_NOTES.md << 'EOF'
# Hearlink Guidam CRM - Phase 3 Release Notes

## Version: Phase 3 Final (v0.3.0)

### 새로운 기능

1. **Device/장비 관리**
   - Hearing Aid 기기 등록/수정/조회
   - Serial Number tracking
   - Battery/Accessory 재고 관리
   - 고객-기기 라이프사이클 연결

2. **Fitting/피팅 관리**
   - FittingLog 생성/조회
   - 착용일, 피팅결과, 만족도, 다음 내원일, 이슈 메모
   - 고객 상세에서 피팅 히스토리 타임라인

3. **Conformity/적합성 심사**
   - 상태머신: PENDING -> IN_REVIEW -> NEEDS_SUPPLEMENT -> APPROVED / REJECTED
   - 심사/보완 이력 로그

4. **Task/업무 관리 + Rule Engine**
   - 직원 할당 Task
   - 고객 상태 기반 자동 Task 생성
   - 동적 Next Action 계산

5. **Document 자동화**
   - 서류 미리보기/다운로드
   - 서명요청 상태 관리

6. **통계/대시보드**
   - 월별 매출
   - 진행 상태별 건수
   - 고객 진행 단계 분포
   - Conversion funnel

### 제외된 기능
- 반응형 UI
- 입금확인자동
- 택배관리
- 다크모드

### 버그 수정
- Schedule API customer relation 수정
- Frontend 캐시 문제 해결
EOF

echo "[완료] RC 패키지 생성: $RC_DIR"

echo ""
echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32m✓ Release Candidate 패키징 완료!\033[0m"
echo -e "\033[0;32m========================================\033[0m"
echo ""
echo "패키지 위치: $RC_DIR"