-- CreateEnum
CREATE TYPE "PeriodSessionStatus" AS ENUM ('LIVE', 'ENDED');

-- CreateTable
CREATE TABLE "PeriodSession" (
    "id" UUID NOT NULL,
    "timetableEntryId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "PeriodSessionStatus" NOT NULL DEFAULT 'LIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedBy" UUID NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PeriodSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeriodSession_date_idx" ON "PeriodSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodSession_timetableEntryId_date_key" ON "PeriodSession"("timetableEntryId", "date");

-- AddForeignKey
ALTER TABLE "PeriodSession" ADD CONSTRAINT "PeriodSession_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "TimetableEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodSession" ADD CONSTRAINT "PeriodSession_startedBy_fkey" FOREIGN KEY ("startedBy") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
