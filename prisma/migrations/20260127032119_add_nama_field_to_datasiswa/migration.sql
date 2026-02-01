/*
  Warnings:

  - Added the required column `nama` to the `DataSiswa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataSiswa" DROP CONSTRAINT "DataSiswa_guruPembimbing_fkey";

-- AlterTable
ALTER TABLE "DataSiswa" ADD COLUMN     "nama" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DataGuru" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "DataGuru_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataGuru_userId_key" ON "DataGuru"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DataGuru_kode_key" ON "DataGuru"("kode");

-- AddForeignKey
ALTER TABLE "DataGuru" ADD CONSTRAINT "DataGuru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSiswa" ADD CONSTRAINT "DataSiswa_guruPembimbing_fkey" FOREIGN KEY ("guruPembimbing") REFERENCES "DataGuru"("id") ON DELETE SET NULL ON UPDATE CASCADE;
