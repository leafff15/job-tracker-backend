/*
  Warnings:

  - A unique constraint covering the columns `[work_setup_name]` on the table `work_setup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "work_setup_work_setup_name_key" ON "work_setup"("work_setup_name");
