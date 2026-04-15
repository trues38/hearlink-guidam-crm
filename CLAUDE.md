# Hearlink Guidam CRM - 개발 원칙

## 1. 프로젝트 특성

**보청기 센터 도메인**: 실무centercrm. 고객 한 명이 상담, 검사, 결제, 문서를 모두 거침.

## 2. 최상위 원칙

### 2.1 고객 상세 허브 중심
- 모든 기능의 목적지: **고객 상세 페이지**
- 고객 목록 → 상세 진입 → 상담/검사/일정/결제 등록 → 확인
- 이것이 핵심 사이클

### 2.2 실무 흐름 우선
```
1. 고객 목록 확인
2. 상세 페이지에서 종합 정보 확인
3. 상담 등록 → 청력검사 등록 → 일정 등록 → 결제 등록
4. 결제 완료 → 문서 준비 → 알림 전송
```
이 흐름이 먼저 동작해야 함.

### 2.3 기존 코드 존중
- **빅뱅 재작성 금지**
- 새 코드보다 기존 코드 개선
- 반드시 추가할 때만 새 파일

### 2.4 검증 후 완료
- Build 성공 필수
- 수동 테스트 증빙 (截图)
- "동작함"，而非 "应该动作"

## 3. 구현 순서

### Phase 1: 핵심 사이클 (지금)
```
고객 목록 → 상세 허브 → 상담 등록 → 청력검사 등록 → 일정 등록 → 결제 등록
```
한 사이클이 브라우저에서 동작해야 함.

### Phase 2: 나머지 탭 연결
- WorkLog 목록/등록
- Notification 목록
- Document 목록

### Phase 3: 외부 연동
- TossPay 결제流程
- Barobill Fax
- 카카오톡 알림

## 4. 코드 작성 규칙

### 4.1 API 호출
- Backend: `http://localhost:3002`
- Frontend: `http://localhost:3001`
- fetch 경로 정확히 지정

### 4.2 주석 금지
- 코드 자체가 설명이 되어야 함
- 복잡한 로직은 함수 이름으로 표현

### 4.3 컴포넌트 구조
-客户提供信息 → Form → API 호출 → 목록 새로고침
- 한 컴포넌트에 여러 탭: tabs 배열 + activeTab state

## 5. 데이터 모델 핵심

### 5.1 Customer (고객)
```
고유한 한 사람. 모든 정보의 중심.
centerId + name + contactNumber (필수)
```

### 5.2 Consultation (상담)
```
Customer 중심. content + method + consultedAt
```

### 5.3 Audiometry (청력검사)
```
Customer 중심. lossType + PureToneResult[] + SpeechTestResult[]
```

### 5.4 Schedule (일정)
```
Customer 중심. title + scheduledAt
```

### 5.5 Sale (결제/고엑)
```
Customer 중심. totalAmount + paidAmount + status
TossPayment가 하위 개념으로 연결
```

## 6. 검증 체크리스트

- [ ] `npm run build` 성공
- [ ] 고객 목록 화면 표시
- [ ] 고객 상세 페이지 진입
- [ ] 상담 등록 → 목록 반영
- [ ] 청력검사 등록 → 목록 반영
- [ ] 일정 등록 → 목록 반영
- [ ] 결제 등록 → 목록 반영
