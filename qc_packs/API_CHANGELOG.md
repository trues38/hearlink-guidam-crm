# API Changelog

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
