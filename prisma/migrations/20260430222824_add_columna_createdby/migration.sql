-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdBy" TEXT NOT NULL DEFAULT 'SYSTEM';
