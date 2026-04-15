# AGENTS.md - 에이전트 작업 규칙

## 1. 역할 구분

### 직접 작업 (간단한 수정)
- 주석 제거
- 오타 수정
- 파일 쓰기 (프로젝트 내)
- 설정 파일

### Executor 에이전트 (코드 변경)
- API 추가/수정
- 컴포넌트 생성/수정
- 타입 추가
- Business logic

### Visual-engineering (UI 작업)
- 새 페이지 작성
- CSS/스타일 변경
- 모달/폼 디자인
- 애니메이션

## 2. 작업 순서

### 2.1 Before Coding
1. 현재 파일 읽기 (반드시)
2. 관련 스키마 확인
3. 기존 패턴 파악

### 2.2 After Coding
1. LSP diagnostics 확인
2. Build 확인 (`npm run build`)
3. 에러 없으면 완료

### 2.3 검증 프로토콜
```
task() → diagnostics → build → "완료" 아니다
task() → diagnostics → build → 수동 테스트 → "완료"
```

## 3. 금지 사항

### 3.1 코드 변경
- `as any` 사용 금지
- `@ts-ignore` 사용 금지
- 빈 catch 블록 금지
- 주석으로 설명 금지

### 3.2 아키텍처
- 빅뱅 재작성 금지
- 기존 파일 덮어쓰기 전 확인
- 새 파일 tanpa 필요성 생성 금지

## 4. Frontend 작업

### 4.1 필수 확인
- `http://localhost:3002` (Backend API)
- `http://localhost:3001` (Frontend)

### 4.2 파일 위치
- `frontend/app/` - 페이지
- `frontend/app/customers/` - 고객 관련
- `frontend/app/components/` - 공통 컴포넌트

### 4.3 작성 규칙
- "use client" directive
- TypeScript 타입 직접 정의
- Tailwind CSS classes 사용
- CSS 클래스 직접 정의 (globals.css)是

## 5. Backend 작업

### 5.1 파일 위치
- `server/index.js` - 모든 API

### 5.2 API 패턴
```javascript
// GET list
app.get('/api/resource', async (req, res) => {
  const { skip, limit, ...filters } = req.query;
  const [items, total] = await Promise.all([...]);
  res.json({ items, total, skip, limit });
});

// GET one
app.get('/api/resource/:id', async (req, res) => {
  const item = await prisma.model.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/resource', async (req, res) => {
  const item = await prisma.model.create({ data: req.body });
  res.status(201).json(item);
});

// PUT update
app.put('/api/resource/:id', async (req, res) => {
  const item = await prisma.model.update({ where: { id: req.params.id }, data: req.body });
  res.json(item);
});
```

## 6. 검증 증빙

완료Reported時:
```
✅ diagnostics: 0 errors
✅ build: success
✅ 수동 테스트: [截图 또는 동작 확인]
```

## 7. 예외 상황

### Build 실패時
1. diagnostics 확인
2. 타입错误 수정
3. 다시 build

### API 동작 안 함時
1. Backend 실행 중인지 확인 (`lsof -i :3002`)
2. API 경로 확인
3. fetch URL 확인
