# Hermes Agent Autonomous Execution Plan

## 📌 Agent Role & Context
**Model**: `minimax m2.7` (or similar autonomous agent)
**Mission**: Connect the existing "Agentic Copilot" frontend UI to a real backend using Vercel AI SDK and Prisma, powered by an open-source model (Gemma) via OpenRouter or Ollama.
**Strict Rule**: **DO NOT MODIFY existing UI designs.** The frontend UI/UX ("Impeccable" Glassmorphism design) is already finalized. Your ONLY job is to build the backend logic, map the database (Prisma), and connect the API.

---

## 🔄 Autonomous Loop Protocol

### Step 1: Initialization & Context Reading
- Read `prisma/schema.prisma` to understand the data structures (`Customer`, `Schedule`, `WorkLog`).
- Read `components/CopilotDrawer.tsx` to understand how the frontend expects to receive Generative UI components.

### Step 2: Infrastructure Setup
- Run `npm install ai zod @ai-sdk/openai` (for OpenRouter) or `ollama-ai-provider` (for local Ollama).
- Create `.env.local` configuration for the chosen provider (OpenRouter API Key or Local URL).

### Step 3: Backend API Implementation (`app/api/chat/route.ts`)
- Implement the Vercel AI SDK `streamText` or `streamUI` endpoint.
- Define `tools` using `zod`:
  - `findCustomer`: Query Prisma by name/phone.
  - `getSchedules`: Query Prisma by date.
  - `createWorkLog`: Insert a new record into `WorkLog` via Prisma.
- **Generative UI Mapping**: When a tool is called, return the pre-built React components (`<CustomerSummaryCard />`, `<ScheduleListCard />`) in the response stream.

### Step 4: Frontend Integration (`components/CopilotDrawer.tsx`)
- Replace the existing `mock messages` state with Vercel AI SDK's `useChat` hook.
- Ensure the streaming responses render the React components correctly in the chat window.

---

## ✅ Verification Criteria (검증 기준)
에이전트는 각 단계를 마친 후 반드시 아래 기준을 통과해야 다음으로 넘어갈 수 있습니다.

1. **LSP Diagnostics**: 
   - 터미널에서 `npx tsc --noEmit` 실행 시 **0 Errors**여야 합니다. (`as any`, `@ts-ignore` 절대 사용 금지)
2. **Build Test**:
   - `npm run build` 실행 시 에러 없이 성공해야 합니다.
3. **API Integrity (툴링 연동 테스트)**:
   - 프론트엔드에서 "김철수 찾아줘"라고 보냈을 때, 백엔드 라우트가 Prisma를 통해 DB를 조회하고, 그 결과를 `<CustomerSummaryCard />` 컴포넌트로 정상 반환해야 합니다.
4. **No UI Regression**:
   - 기존의 Tailwind CSS 클래스나 Framer Motion 애니메이션 코드가 훼손되지 않았는지 확인합니다.

---

## 🛠️ Tech Stack & Snippets for Hermes
- **Framework**: Next.js 14 (App Router)
- **SDK**: Vercel AI SDK (`ai` package)
- **DB**: Prisma ORM
- **LLM Setup (OpenRouter Example)**:
```typescript
import { createOpenAI } from '@ai-sdk/openai';
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});
// Usage: openrouter('google/gemma-7b-it')
```

> **Hermes Agent Instruction:** Start your execution from Phase 3 (Backend Implementation). If you encounter build errors, halt the loop, read the diagnostics, fix the TypeScript types, and rebuild before proceeding.
