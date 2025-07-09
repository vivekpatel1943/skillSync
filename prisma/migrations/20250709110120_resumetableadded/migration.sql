/*
  Warnings:

  - You are about to drop the column `upload_id` on the `Employer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `jobExperience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proof_of_work` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resumeId]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentials` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumeId` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_userId_fkey";

-- DropIndex
DROP INDEX "Skill_userId_key";

-- AlterTable
ALTER TABLE "Employer" DROP COLUMN "upload_id",
ADD COLUMN     "credentials" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "userId",
ADD COLUMN     "resumeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "jobExperience",
DROP COLUMN "proof_of_work";

-- CreateTable
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "jobExperience" TEXT NOT NULL,
    "proof_of_work" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_resumeId_key" ON "Skill"("resumeId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
