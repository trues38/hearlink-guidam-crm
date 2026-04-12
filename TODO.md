# Hearlink Guidam CRM v2 - TODO

## 현재 상태 (2026-04-12)

### ✅ 완료
- [x] Backend API: Customer CRUD, Consultation, Audiometry, Schedule, Payment(Sale), TossPay
- [x] Frontend: 고객 목록 페이지 (CRUD 모달 포함)
- [x] Frontend: 고객 상세 허브 페이지 (탭 7개)
- [x] Docker PostgreSQL (port 5433)

### ⚠️ 미완성 (사용자가 확인 안 된 것)
- [ ] Customer Detail Hub Page - 실제로 작동하는가?
- [ ] 상담/청력검사/일정/결제 Form - 동작 확인 필요
- [ ] 고객 상세 페이지에서 "뒤로 가기" -> 목록으로 이동
- [ ] Frontend-dev 서버가 새 코드 반영했는가?

### ❌ 아직 안됨
- [ ] Consultations CRUD (상세 페이지)
- [ ] Audiometries CRUD (상세 페이지)  
- [ ] Schedules CRUD (상세 페이지)
- [ ] Payments CRUD (상세 페이지)
- [ ] WorkLogs 목록
- [ ] Notifications 목록
- [ ] Documents 목록
- [ ] Schedule 캘린더 뷰

---

##Phase 1: 동작 확인 (오늘)
1. Backend 서버 재시작 확인
2. Frontend-dev 서버 재시작
3. 고객 등록 -> 상세 페이지 -> 상담 등록까지 **한 사이클** 테스트

## Phase 2:残基础教育 (3일)
1. Consultations CRUD 완료
2. Audiometries CRUD 완료
3. Schedules CRUD 완료
4. Payments CRUD 완료

## Phase 3: 연결 및 고급 기능 (1주일)
1. Customer Detail Hub 탭들 실제 데이터 연결
2. Schedule 캘린더 뷰
3. TossPay 연동
4. WorkLogs, Notifications, Documents 탭

---

## 서버 상태
- **Backend**: `~/Documents/project/hearlink-guidam-crm/server/index.js` (port 3002)
- **Frontend**: `~/Documents/project/hearlink-guidam-crm/frontend/` (port 3001)
- **DB**: Docker PostgreSQL (port 5433)

## 실행 명령
```bash
# Backend 재시작
cd ~/Documents/project/hearlink-guidam-crm
pkill -f "node server" && node server/index.js &

# Frontend 재시작
cd ~/Documents/project/hearlink-guidam-crm/frontend
npm run dev
```
