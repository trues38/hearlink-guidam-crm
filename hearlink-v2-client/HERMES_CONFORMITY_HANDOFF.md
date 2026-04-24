# Hermes Agent Execution Plan: Conformity Workflow Backend

## 📌 Agent Role & Context
**Model**: `minimax m2.7` (or similar autonomous agent)
**Mission**: Implement the backend API (`app/api/conformity/route.ts` and related) to serve real database data for the newly redesigned Conformity Workflow Kanban UI.
**Strict Rule**: **DO NOT MODIFY existing UI designs.** The frontend UI/UX in `app/conformity/page.tsx` is already finalized with mock data. Your job is to replace the `mockData` with a real `fetch` from the database.

---

## 🔄 Backend Implementation Requirements

### 1. Database Schema Check (Prisma)
- Check `prisma/schema.prisma` for `ConformityRecord` and `CustomerDevice`.
- The new workflow uses 4 terminal/active statuses: `TARGET`, `DOC_SUBMITTED`, `PAYMENT_CONFIRMED`, `EXPIRED`.
- **Action**: If `ConformityStatus` enum in Prisma doesn't match these exactly, update the `enum ConformityStatus` and run `npx prisma db push` or `npx prisma migrate dev`.

### 2. Auto-Calculation Logic (The Core AI/Backend logic)
When the frontend fetches `GET /api/conformity`:
1. Find all `CustomerDevice` records.
2. For each active device, calculate the current `targetRound` (1, 2, 3, 4) based on the `purchaseDate`. 
   - *Example: 1st round = 1 month after purchase, 2nd round = 1 year, 3rd = 2 years, 4th = 3 years.*
3. If the `purchaseDate` is older than 4.5 years, `targetRound` should be returned as string `'RENEWAL'`.
4. Calculate `dueDate` (마감일) based on the round's standard timeframe + 1 year limit.
5. If the current date > `dueDate`, automatically update the DB status to `EXPIRED` (기간만료).

### 3. API Endpoint (`app/api/conformity/route.ts`)
- **GET**: Return the list of conformity targets mapped exactly to the `ConformityRecord` interface defined in `app/conformity/page.tsx` (id, customerId, name, contactNumber, device, purchaseDate, targetRound, dueDate, status).
- **PUT / PATCH**: Create an endpoint to allow the frontend to change status (e.g., `TARGET` -> `DOC_SUBMITTED` -> `PAYMENT_CONFIRMED`).

### 4. Frontend Integration
- Open `app/conformity/page.tsx`.
- Remove the `initialData` array.
- Add a `useEffect` to fetch data from `/api/conformity`.
- Ensure the `changeStatus` function calls the `PUT` API instead of modifying local state.

---

## ✅ Verification Criteria
1. `npx tsc --noEmit` -> 0 Errors.
2. `npm run build` -> Success.
3. Access `http://localhost:3001/conformity`. The table should load real data from your local Postgres/Prisma DB instead of the hardcoded names like "김철수", "유재석".
