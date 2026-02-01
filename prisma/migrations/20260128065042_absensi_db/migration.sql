/*
  Warnings:

  - You are about to drop the column `kode` on the `DataGuru` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `DataGuru` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `DataSiswa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DataGuru" DROP CONSTRAINT "DataGuru_userId_fkey";

-- DropForeignKey
ALTER TABLE "DataSiswa" DROP CONSTRAINT "DataSiswa_guruPembimbing_fkey";

-- DropForeignKey
ALTER TABLE "DataSiswa" DROP CONSTRAINT "DataSiswa_userId_fkey";

-- DropIndex
DROP INDEX "DataGuru_kode_key";

-- AlterTable
ALTER TABLE "DataGuru" DROP COLUMN "kode",
DROP COLUMN "nama",
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "DataSiswa" DROP COLUMN "nama",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "guruPembimbing" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "DataGuru" ADD CONSTRAINT "DataGuru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSiswa" ADD CONSTRAINT "DataSiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSiswa" ADD CONSTRAINT "DataSiswa_guruPembimbing_fkey" FOREIGN KEY ("guruPembimbing") REFERENCES "DataGuru"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
