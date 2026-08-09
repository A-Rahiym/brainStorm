-- CreateEnum
CREATE TYPE "SchoolEventType" AS ENUM ('MEETING', 'DEADLINE', 'EXAM', 'ACTIVITY');

-- CreateTable
CREATE TABLE "SchoolEvent" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "SchoolEventType" NOT NULL DEFAULT 'MEETING',
    "date" DATE NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolEvent_schoolId_date_idx" ON "SchoolEvent"("schoolId", "date");

-- AddForeignKey
ALTER TABLE "SchoolEvent" ADD CONSTRAINT "SchoolEvent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
