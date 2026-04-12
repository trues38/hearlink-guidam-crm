# ARCHITECTURE.md - 구조 설계

## 1. 시스템 구성

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│                    Next.js App Router                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Customer  │  │Schedule  │  │Payment   │   │
│  └──────────┘  │ Hub Page │  │Calendar  │  │TossPay   │   │
│                └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ http://localhost:3002
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                      Express + Prisma                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Customer  │  │Consult-  │  │Audiom-   │  │Schedule  │   │
│  │CRUD      │  │ation API │  │etry API  │  │API       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Payment   │  │TossPay   │  │WorkLog   │  │Notifi-   │   │
│  │Sale API  │  │Client    │  │API       │  │cation API│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       PostgreSQL                            │
│                   Docker (port 5433)                        │
└─────────────────────────────────────────────────────────────┘
```

## 2. 데이터 흐름

### 2.1 고객 CRUD 흐름
```
Frontend                Backend                 Database
   │                      │                       │
   │ POST /api/customers  │                       │
   │─────────────────────>│                       │
   │                      │ prisma.customer.create│
   │                      │─────────────────────>│
   │                      │                       │
   │  201 Created         │                       │
   │<─────────────────────│                       │
```

### 2.2 고객 상세 허브 흐름
```
Frontend                Backend                 Database
   │                      │                       │
   │ GET /api/customers/:id                       │
   │ (include: consultations, audiometries,        │
   │          sales, workLogs, documents,          │
   │          notifications)                        │
   │─────────────────────>│                       │
   │                      │ prisma.customer.findUnique
   │                      │ + include relations   │
   │                      │─────────────────────>│
   │                      │                       │
   │  Customer + All Relations                      │
   │<─────────────────────│                       │
```

### 2.3 결제 → TossPay 흐름
```
Sale (Parent)              TossPayment (Child)
─────────────────           ─────────────────────
totalAmount                 amount
paidAmount                  paymentKey
status ──────────────────>  status
                            approvedAt
```

## 3. 책임 분리

### 3.1 Frontend 책임
- UI 렌더링
- 사용자 입력 처리
- API 호출
- 상태 관리

### 3.2 Backend 책임
- API 라우팅
- 비즈니스 로직
- DB 접근 (Prisma)
- 외부 API 연동 (TossPay, Barobill)

### 3.3 Database 책임
- 데이터 저장
- 무결성 제약
- 관계 관리

## 4. 현재 구조

### 4.1 Backend (server/index.js)
```
 monolith - 모든 API가 하나의 파일에
 ├── Health check
 ├── WorkLog CRUD
 ├── Notification CRUD
 ├── Document CRUD
 ├── TossPay (request/confirm/cancel)
 ├── Barobill Fax
 ├── Payment (Sale CRUD)
 ├── Customer CRUD
 ├── Consultation CRUD
 ├── Audiometry CRUD
 └── Schedule CRUD
```

### 4.2 Frontend (frontend/app/)
```
app/
├── page.tsx              - Dashboard
├── layout.tsx           - Root layout + Sidebar
├── customers/
│   ├── page.tsx         - 고객 목록 (카드형)
│   └── [id]/page.tsx   - 고객 상세 허브 (탭 7개)
├── worklogs/page.tsx
├── notifications/page.tsx
├── documents/page.tsx
└── payments/page.tsx
```

## 5. 외부 연동

### 5.1 TossPay
```
Frontend ──> Backend ──> TossPay Server
             │
             └── Sale 생성 (parent)
             └── TossPayment 생성 (child)
```

### 5.2 Barobill
```
Frontend ──> Backend ──> Barobill API
             │
             └── TaxInvoice 관리
             └── Fax 전송 상태
```

### 5.3 카카오톡
```
Backend ──> 카카오톡 API ──> 사용자
   │
   └── Notification 생성
   └── KakaoTalkLog 기록
```

## 6. 구조 목표 (Roadmap)

### 현재 → 모듈화
```
 monolith ──────────────────> 模块화
   │                              │
   │                        modules/
   │                        ├── customer/
   │                        ├── consultation/
   │                        ├── audiometry/
   │                        ├── schedule/
   │                        ├── payment/
   │                        │   ├── tosspay/
   │                        │   └── barobill/
   │                        ├── worklog/
   │                        ├── notification/
   │                        └── document/
```

### Frontend → App Router
```
현재                            목표
page.tsx (SPA-ish)     →     App Router (RSC)
                         
                         customer/
                         ├── page.tsx (목록)
                         └── [id]/
                             ├── page.tsx (상세)
                             ├── consultations/
                             │   └── new/page.tsx
                             ├── audiometries/
                             │   └── new/page.tsx
                             └── ...
```

## 7. API 계약

### 7.1 고객 상세 조회 (GET /api/customers/:id)
```json
{
  "id": "uuid",
  "name": "홍길동",
  "contactNumber": "010-1234-5678",
  "classification": "SELF",
  "consultations": [...],
  "audiometries": [...],
  "sales": [...],
  "workLogs": [...],
  "documents": [...],
  "notifications": [...]
}
```

### 7.2 결제 상태
```
Sale.status:
  - UNPAID    → 미결제
  - PAID      → 결제완료
  - REFUNDED  → 환불됨

TossPayment.status:
  - READY           → 대기
  - IN_PROGRESS     → 진행중
  - DONE            → 완료
  - CANCELLED       → 취소
  - PARTIAL_CANCELLED → 부분취소
  - FAILED          → 실패
```

## 8. 보안 고려사항

### 8.1 현재
- centerId 기반 데이터 분리 (future)
- API 인증 없음 (dev 모드)

### 8.2 목표
- JWT 인증
- Center별 데이터 격리
- Role 기반 접근 제어 (ADMIN/MANAGER/STAFF)
