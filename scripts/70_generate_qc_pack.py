#!/usr/bin/env python3
"""
70_generate_qc_pack.py - 검수팩 자동 생성
"""

import os
import json
from datetime import datetime


def main():
    print("=== 70_generate_qc_pack.py - QA 리포트 생성 ===")

    project_dir = "/Users/js/Documents/project/hearlink-guidam-crm"
    output_dir = f"{project_dir}/qc_packs"
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Generate QA Report
    qa_report = {
        "title": "Hearlink Guidam CRM - Phase 3 QA Report",
        "generated_at": timestamp,
        "phases_completed": [
            "Phase 1: 스크립트 인프라",
            "Phase 2: Device/장비 관리",
            "Phase 3: Fitting/피팅 관리",
            "Phase 4: Conformity/적합성 심사",
            "Phase 5: Task/업무 관리 + Rule Engine",
            "Phase 6: Document 자동화",
            "Phase 7: 통계/대시보드",
            "Phase 8: CustomerEvent 이벤트 소싱",
        ],
        "excluded_features": ["반응형 UI", "입금확인자동", "택배관리", "다크모드"],
        "e2e_scenarios": {
            "S1": "상담 -> 신착 -> 착용 -> 결제연락 자동 Task 생성",
            "S2": "처방 -> 제조접수 -> 신착대기 -> 검수진행 next action",
            "S3": "적합성 보완요청 발생 시 Task 자동 생성/갱신",
            "S4": "피팅 기록 생성 시 다음 피팅 리마인드 생성",
            "S5": "장비 serial 조회 및 고객 이력 연결 확인",
            "S6": "배터리/액세서리 재고 차감/복구 흐름",
            "S7": "월별 매출 통계 반영 검증",
        },
    }

    # Save QA Report
    qa_path = f"{output_dir}/QA_REPORT.md"
    with open(qa_path, "w", encoding="utf-8") as f:
        f.write(f"# Hearlink Guidam CRM - Phase 3 QA Report\n\n")
        f.write(f"**Generated:** {timestamp}\n\n")
        f.write(f"## 완료 Phases\n\n")
        for phase in qa_report["phases_completed"]:
            f.write(f"- {phase}\n")
        f.write(f"\n## 제외된 기능 (명시적)\n\n")
        for feat in qa_report["excluded_features"]:
            f.write(f"- ~~{feat}~~\n")
        f.write(f"\n## E2E 시나리오\n\n")
        for s, desc in qa_report["e2e_scenarios"].items():
            f.write(f"- **{s}:** {desc}\n")

    # Generate API Changelog
    api_changelog = f"""# API Changelog

## Phase 3 추가 API

### Device Management
- `GET /api/devices` - 장비 목록
- `POST /api/devices` - 장비 등록
- `GET /api/devices/:id` - 장비 상세
- `PUT /api/devices/:id` - 장비 수정
- `DELETE /api/devices/:id` - 장비 삭제
- `GET /api/devices/serial/:serial` - Serial로 조회

### Battery/Accessory
- `GET /api/batteries` - 배터리 재고
- `POST /api/batteries/adjust` - 재고 조정

### Fitting
- `GET /api/fittings` - 피팅 이력
- `POST /api/fittings` - 피팅 등록
- `GET /api/fittings/:id` - 피팅 상세

### Conformity
- `GET /api/conformity/:customerId` - 적합성 심사 정보
- `POST /api/conformity/:customerId` - 심사 생성/수정
- `PUT /api/conformity/:customerId/status` - 상태 변경

### Tasks
- `GET /api/tasks` - 작업 목록
- `POST /api/tasks` - 작업 생성
- `PUT /api/tasks/:id` - 작업 수정
- `PUT /api/tasks/:id/complete` - 작업 완료

### Customer Events (Event Sourcing)
- `GET /api/customers/:id/events` - 고객 이벤트 이력
- `POST /api/customers/:id/events` - 이벤트 기록
"""

    api_path = f"{output_dir}/API_CHANGELOG.md"
    with open(api_path, "w", encoding="utf-8") as f:
        f.write(api_changelog)

    print(f"✓ QA_REPORT.md: {qa_path}")
    print(f"✓ API_CHANGELOG.md: {api_path}")
    print("\033[0;32m✓ QA 패acks 생성 완료!\033[0m")


if __name__ == "__main__":
    main()
