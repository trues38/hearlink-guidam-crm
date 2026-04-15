#!/usr/bin/env python3
"""
20_seed_master.py - 마스터 데이터 시드
"""

import json
import os
import sys
from pathlib import Path


def main():
    print("=== 20_seed_master.py - 마스터 데이터 시드 ===")

    # Prisma client import via subprocess
    # This script generates seed data for:
    # - Task Rules (rule engine)
    # - Status codes
    # - Default settings

    seed_data = {
        "task_rules": [
            {
                "code": "R1",
                "enabled": True,
                "priority": 1,
                "name": "결제연락 필요",
                "condition": {
                    "hasDeviceFitted": True,
                    "hasUnpaidSale": True,
                    "status": "COMPLETED",
                },
                "action_type": "PAYMENT_CONTACT",
                "action_title_template": "결제연락 필요 (장비착용완료)",
                "due_days": 1,
            },
            {
                "code": "R2",
                "enabled": True,
                "priority": 2,
                "name": "신착안내",
                "condition": {
                    "hasPrescription": True,
                    "hasManufacturing": True,
                    "status": "MANUFACTURING_COMPLETE",
                },
                "action_type": "NEW_DEVICE_GUIDE",
                "action_title_template": "신착 안내 (제조완료)",
                "due_days": 0,
            },
            {
                "code": "R3",
                "enabled": True,
                "priority": 3,
                "name": "검수보완요청",
                "condition": {"conformityStatus": "NEEDS_SUPPLEMENT"},
                "action_type": "SUPPLEMENT_REQUEST",
                "action_title_template": "적합성 보완요청 확인",
                "due_days": 2,
            },
            {
                "code": "R4",
                "enabled": True,
                "priority": 4,
                "name": "다음피팅리마인드",
                "condition": {"hasFitting": True, "nextVisitAt": "IS_SET"},
                "action_type": "FITTING_REMINDER",
                "action_title_template": "다음 피팅 리마인드",
                "due_type": "FROM_NEXT_VISIT",
                "due_offset_days": -1,
            },
            {
                "code": "R5",
                "enabled": True,
                "priority": 5,
                "name": "미결제후속연락",
                "condition": {"hasUnpaidSale": True, "daysSinceUnpaid": 7},
                "action_type": "FOLLOW_UP_PAYMENT",
                "action_title_template": "미결제 후속 연락 필요",
                "due_days": 0,
                "priority_override": "HIGH",
            },
        ],
        "device_status": [
            {"code": "AVAILABLE", "label": "재고있음"},
            {"code": "RESERVED", "label": "예약됨"},
            {"code": "SOLD", "label": "판매완료"},
            {"code": "RETURED", "label": "반환"},
        ],
        "conformity_status": [
            {"code": "PENDING", "label": "검수대기"},
            {"code": "IN_REVIEW", "label": "검수중"},
            {"code": "NEEDS_SUPPLEMENT", "label": "보완요청"},
            {"code": "APPROVED", "label": "승인완료"},
            {"code": "REJECTED", "label": "반려"},
        ],
    }

    # Output seed JSON for backend to consume
    project_dir = Path(__file__).resolve().parents[1]
    output_path = project_dir / "server" / "seeds" / "master_seed.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(seed_data, f, ensure_ascii=False, indent=2)

    print(f"✓ 마스터 시드 데이터 생성: {output_path}")
    print(f"  - Task Rules: {len(seed_data['task_rules'])}개")
    print(f"  - Device Status: {len(seed_data['device_status'])}개")
    print(f"  - Conformity Status: {len(seed_data['conformity_status'])}개")
    print("\033[0;32m✓ 마스터 데이터 시드 완료!\033[0m")


if __name__ == "__main__":
    main()
