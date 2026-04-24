#!/usr/bin/env python3
"""
30_backfill_status.py - 기존 고객 데이터 Rule Engine 백필

이 스크립트는 기존 고객 데이터를 스캔하여:
1. 각 고객의 현재 상태(장비착용, 결제상태, 적합성심사 등)를 평가
2. Rule Engine 조건에 맞는 자동 Task 생성
3. CustomerEvent 기록 생성
"""

import json
import os
import sys
from datetime import datetime, timedelta

# Configuration
API_BASE = os.environ.get("API_BASE", "http://localhost:3002")
CENTER_ID = os.environ.get("CENTER_ID", "default-center-id")

# Rule Engine definitions (mirrors 20_seed_master.py)
RULES = [
    {
        "code": "R1",
        "name": "결제연락 필요",
        "condition": {
            "hasDeviceFitted": True,
            "hasUnpaidSale": True,
            "status": "COMPLETED",
        },
        "action_type": "PAYMENT_CONTACT",
        "action_title": "결제연락 필요 (장비착용완료)",
        "due_days": 1,
    },
    {
        "code": "R2",
        "name": "신착안내",
        "condition": {
            "hasPrescription": True,
            "hasManufacturing": True,
            "status": "MANUFACTURING_COMPLETE",
        },
        "action_type": "NEW_DEVICE_GUIDE",
        "action_title": "신착 안내 (제조완료)",
        "due_days": 0,
    },
    {
        "code": "R3",
        "name": "검수보완요청",
        "condition": {"conformityStatus": "NEEDS_SUPPLEMENT"},
        "action_type": "SUPPLEMENT_REQUEST",
        "action_title": "적합성 보완요청 확인",
        "due_days": 2,
    },
    {
        "code": "R4",
        "name": "다음피팅리마인드",
        "condition": {"hasFitting": True, "nextVisitAt": "IS_SET"},
        "action_type": "FITTING_REMINDER",
        "action_title": "다음 피팅 리마인드",
        "due_days": -1,  # next_visit_at - 1 day
    },
    {
        "code": "R5",
        "name": "미결제후속연락",
        "condition": {"hasUnpaidSale": True, "daysSinceUnpaid": 7},
        "action_type": "FOLLOW_UP_PAYMENT",
        "action_title": "미결제 후속 연락 필요",
        "due_days": 0,
        "priority_override": 2,  # HIGH
    },
]


def api_get(endpoint):
    """GET request helper"""
    import urllib.request

    url = f"{API_BASE}{endpoint}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [WARN] API GET {url} failed: {e}")
        return None


def api_post(endpoint, data):
    """POST request helper"""
    import urllib.request

    url = f"{API_BASE}{endpoint}"
    payload = json.dumps(data).encode()
    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [WARN] API POST {url} failed: {e}")
        return None


def evaluate_customer(customer):
    """Evaluate all rules for a customer and return matching actions"""
    customer_id = customer.get("id")
    matches = []

    # Gather customer state
    state = {
        "hasConsultation": len(customer.get("consultations", [])) > 0,
        "hasAudiometry": len(customer.get("audiometries", [])) > 0,
        "hasSale": len(customer.get("sales", [])) > 0,
        "hasPaidSale": any(
            s.get("status") == "PAID" for s in customer.get("sales", [])
        ),
        "hasUnpaidSale": any(
            s.get("status") == "UNPAID" for s in customer.get("sales", [])
        ),
        "hasDevice": len(customer.get("devices", [])) > 0,
        "hasFitting": len(customer.get("fittingLogs", [])) > 0,
        "hasSchedule": len(customer.get("schedules", [])) > 0,
        "hasConformity": len(customer.get("conformityRecords", [])) > 0,
    }

    # Get latest conformity status
    conformity_records = customer.get("conformityRecords", [])
    if conformity_records:
        latest_conformity = conformity_records[0]  # sorted desc
        state["conformityStatus"] = latest_conformity.get("status")

    # Get unpaid sale age
    unpaid_sales = [s for s in customer.get("sales", []) if s.get("status") == "UNPAID"]
    if unpaid_sales:
        oldest_unpaid = min(unpaid_sales, key=lambda s: s.get("createdAt", ""))
        created = oldest_unpaid.get("createdAt", "")
        if created:
            try:
                created_date = datetime.fromisoformat(created.replace("Z", "+00:00"))
                state["daysSinceUnpaid"] = (
                    datetime.now() - created_date.replace(tzinfo=None)
                ).days
            except:
                state["daysSinceUnpaid"] = 0

    # Evaluate each rule
    for rule in RULES:
        if not rule.get("enabled", True):
            continue

        condition = rule.get("condition", {})
        matched = True

        # Check condition keys against state
        for key, expected in condition.items():
            actual = state.get(key)

            if key == "daysSinceUnpaid" and isinstance(expected, int):
                if not (actual and actual >= expected):
                    matched = False
                    break
            elif key == "nextVisitAt" and expected == "IS_SET":
                # Check if there's a future schedule
                schedules = customer.get("schedules", [])
                future_schedule = None
                for sched in schedules:
                    sched_date = sched.get("scheduledAt", "")
                    if sched_date:
                        try:
                            dt = datetime.fromisoformat(
                                sched_date.replace("Z", "+00:00")
                            )
                            if dt > datetime.now():
                                future_schedule = dt
                                break
                        except:
                            pass
                if not future_schedule:
                    matched = False
            elif actual != expected:
                matched = False
                break

        if matched:
            due_days = rule.get("due_days", 0)
            due_at = None
            if due_days == -1:  # Special case for R4 (next visit - 1 day)
                # Find next schedule
                for sched in customer.get("schedules", []):
                    sched_date = sched.get("scheduledAt", "")
                    if sched_date:
                        try:
                            dt = datetime.fromisoformat(
                                sched_date.replace("Z", "+00:00")
                            )
                            if dt > datetime.now():
                                due_at = (
                                    dt.replace(tzinfo=None) - timedelta(days=1)
                                ).isoformat()
                                break
                        except:
                            pass
            elif due_days != 0:
                due_at = (datetime.now() + timedelta(days=due_days)).isoformat()

            matches.append(
                {
                    "rule_code": rule["code"],
                    "action_type": rule["action_type"],
                    "action_title": rule["action_title"],
                    "due_at": due_at,
                    "priority": rule.get("priority_override", 1),
                }
            )

    return matches


def process_customer(customer):
    """Process a single customer - evaluate rules and create tasks"""
    customer_id = customer["id"]
    customer_name = customer.get("name", "Unknown")

    # Get full customer data with all relations
    full_customer = api_get(f"/api/customers/{customer_id}")
    if not full_customer:
        return 0, 0

    matches = evaluate_customer(full_customer)

    tasks_created = 0
    events_created = 0

    for action in matches:
        # Create task
        task_data = {
            "centerId": CENTER_ID,
            "customerId": customer_id,
            "type": "NEW_DEVICE",  # Default type
            "memo": f"[{action['rule_code']}] {action['action_title']}",
            "dueAt": action["due_at"],
            "priority": action["priority"],
        }

        result = api_post("/api/tasks", task_data)
        if result:
            tasks_created += 1
            print(f"    + Task created: {action['action_title']}")

            # Create customer event
            event_data = {
                "customerId": customer_id,
                "eventType": "TASK_AUTO_CREATED",
                "payload": json.dumps(
                    {
                        "taskId": result.get("id"),
                        "ruleCode": action["rule_code"],
                        "actionType": action["action_type"],
                    }
                ),
                "createdBy": "rule-engine",
            }
            api_post(f"/api/customers/{customer_id}/events", event_data)
            events_created += 1

    return tasks_created, events_created


def main():
    print("=== 30_backfill_status.py - Rule Engine 백필 ===")
    print()

    # Get all customers
    print("[1/3] 고객 목록 조회 중...")
    customers_data = api_get(f"/api/customers?limit=1000")
    if not customers_data:
        print(
            "[ERROR] 고객 목록을 가져올 수 없습니다. Backend가 실행 중인지 확인하세요."
        )
        print(f"  API_BASE: {API_BASE}")
        sys.exit(1)

    customers = customers_data.get("items", [])
    print(f"  총 {len(customers)}명의 고객 발견")

    # Process each customer
    print()
    print("[2/3] Rule Engine 평가 중...")
    total_tasks = 0
    total_events = 0

    for i, customer in enumerate(customers):
        customer_id = customer.get("id")
        customer_name = customer.get("name", "Unknown")
        print(f"  [{i + 1}/{len(customers)}] {customer_name}...", end=" ")

        tasks, events = process_customer(customer)
        total_tasks += tasks
        total_events += events

        if tasks > 0:
            print(f"→ {tasks}개 태스크 생성")
        else:
            print("→ 변경없음")

    # Summary
    print()
    print("[3/3] 완료")
    print(f"  총 {len(customers)}명의 고객 처리")
    print(f"  생성된 태스크: {total_tasks}개")
    print(f"  생성된 이벤트: {total_events}개")

    if total_tasks > 0:
        print()
        print("\033[0;32m✓ Rule Engine 백필 완료!\033[0m")
    else:
        print()
        print("\033[0;33m⚠ 백필 결과: 신규 태스크 없음 (모든 고객이 최신 상태)\033[0m")


if __name__ == "__main__":
    main()
