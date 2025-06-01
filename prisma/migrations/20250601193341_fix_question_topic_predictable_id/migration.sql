/*
  Warnings:

  - The primary key for the `questions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `questionId` on the `questions_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "questions_events" DROP CONSTRAINT "questions_events_questionId_fkey";

-- AlterTable
ALTER TABLE "questions" DROP CONSTRAINT "questions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "questions_events" DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "questions_events_userId_questionId_topicId_key" ON "questions_events"("userId", "questionId", "topicId");

-- AddForeignKey
ALTER TABLE "questions_events" ADD CONSTRAINT "questions_events_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
