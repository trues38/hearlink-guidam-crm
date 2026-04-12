# Hearlink Guidam CRM v2

보청기 현장centercrm 시스템. 고객 상담, 청력검사, 일정, 결제, 문서, 업무일지, 알림을 하나의 고객 상세 허브에서 관리.

## 프로젝트 위치

```
~/Documents/project/hearlink-guidam-crm/
```

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 |
| Backend | Node.js + Express + Prisma ORM |
| Database | PostgreSQL 5433 (Docker) |
| API Port | 3002 |
| Frontend Port | 3001 |

## 빠른 시작

```bash
# 1. 프로젝트 이동
cd ~/Documents/project/hearlink-guidam-crm

# 2. Docker PostgreSQL 실행
docker-compose up -d

# 3. Backend 실행
node server/index.js &

# 4. Frontend 실행
cd frontend && npm run dev

# 5. 접속
# Frontend: http://localhost:3001
# Backend API: http://localhost:3002
```

## 프로젝트 구조

```
hearlink-guidam-crm/
├── prisma/schema.prisma    # DB 스키마 (21개 모델)
├── server/index.js         # Backend API 서버
├── frontend/               # Next.js App Router
│   └── app/
│       ├── customers/      # 고객 목록 + 상세 허브
│       ├── worklogs/       # 업무일지
│       ├── notifications/  # 알림
│       ├── documents/      # 문서
│       ├── payments/       # 결제 (Sale + TossPay)
│       └── page.tsx        # Dashboard
└── docker-compose.yml      # PostgreSQL
```

## 핵심 개발 원칙

1. **고객 상세 허브 중심**: 모든 기능은 고객 상세 페이지에서 출발
2. **실무 흐름 우선**: 목록 → 상세 → 등록/수정/삭제 사이클 먼저
3. **기존 코드 존중**: 새 작성 금지, 기존 코드 개선
4. **검증 후 완료**: Build 성공 + 수동 테스트 증빙

## 개발 상태

| 모듈 | Backend | Frontend |
|------|---------|----------|
| Customer CRUD | ✅ | ✅ 목록 + 상세허브 |
| Consultation | ✅ | ⚠️ 상세내 폼 |
| Audiometry | ✅ | ⚠️ 상세내 폼 |
| Schedule | ✅ | ⚠️ 상세내 폼 |
| Payment (Sale) | ✅ | ⚠️ 상세내 폼 |
| TossPay | ✅ | ❌ |
| WorkLog | ✅ | ❌ |
| Notification | ✅ | ❌ |
| Document | ✅ | ❌ |

## 문서

- [TODO.md](TODO.md) - 실행 TODO
- [CLAUDE.md](CLAUDE.md) - 개발 원칙
- [AGENTS.md](AGENTS.md) - 에이전트 작업 규칙
- [docs/PRODUCT.md](docs/PRODUCT.md) - 제품 정의
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - 구조 설계
