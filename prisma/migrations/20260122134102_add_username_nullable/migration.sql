/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "DataSiswa" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "kelas" TEXT NOT NULL,
    "tempatPKL" TEXT,

    CONSTRAINT "DataSiswa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSiswa_userId_key" ON "DataSiswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "DataSiswa" ADD CONSTRAINT "DataSiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
