-- AlterTable
ALTER TABLE "DataSiswa" ADD COLUMN     "guruPembimbing" INTEGER;

-- AddForeignKey
ALTER TABLE "DataSiswa" ADD CONSTRAINT "DataSiswa_guruPembimbing_fkey" FOREIGN KEY ("guruPembimbing") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
