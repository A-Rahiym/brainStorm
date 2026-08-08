# Seed Data

These JSON files are loaded by `prisma/seed.ts` when you run `pnpm db:seed`.

Edit them to match the records you want to test with, then re-run `pnpm db:seed` (the loader is idempotent — it upserts by unique keys).

## Files

- `headmasters.json` — Headmaster profile fields. Optional `authEmail` links the staff record to an existing `User` (resolved by email) — this is what makes the session resolve `schoolId`/`headmasterId` on login.
- `teachers.json` — Teacher profile fields. Same optional `authEmail` linking.
- `students.json` — Student records. No user link (students have no account yet).

## Dates

All date fields are ISO `YYYY-MM-DD` strings; the loader converts them.

## Idempotency

- Headmaster: upserted by `staffNumber`.
- Teacher: upserted by `(schoolId, staffNumber)`.
- Student: upserted by `(schoolId, admissionNumber)`.
