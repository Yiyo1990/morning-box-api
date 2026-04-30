-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "textSearch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "textSearch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "textSearch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "textSearch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "textSearch" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "roles" SET DEFAULT ARRAY['USER']::"Role"[];
