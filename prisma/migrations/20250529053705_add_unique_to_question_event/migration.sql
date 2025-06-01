/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId,topicId]` on the table `questions_events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "questions_events_userId_questionId_topicId_key" ON "questions_events"("userId", "questionId", "topicId");
