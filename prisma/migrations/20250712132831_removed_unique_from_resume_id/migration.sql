/*
  Warnings:

  - You are about to drop the column `experience` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `yearsOfExperience` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Skill_resumeId_key";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "experience",
ADD COLUMN     "yearsOfExperience" DOUBLE PRECISION NOT NULL;
