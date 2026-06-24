# LeetCoach AI Backend

## Setup
1. `npm install`
2. Ensure `.env` is populated with `DATABASE_URL`, `GEMINI_API_KEY`, and `GROQ_API_KEY`.
3. `npx prisma generate`

## Launch
- Run server: `npx ts-node src/server.ts`
- Access DB: `npx prisma studio`

## Architecture
- **AI Service:** Uses `gemini-3.5-flash` with exponential backoff and a `Groq` (Llama 3.3) failover.
- **Caching:** Logic implemented in `attempt.controller.ts` to skip AI calls if identical `problemId` + `codeSnapshot` feedback exists in DB.