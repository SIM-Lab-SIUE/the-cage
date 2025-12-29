/*
  Warnings:

  - You are about to drop the column `assetType` on the `reservations` table. All the data in the column will be lost.
  - Added the required column `category` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snipeAssetId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL,
    CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_snipeAssetId_fkey" FOREIGN KEY ("snipeAssetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_reservations" ("endTime", "id", "snipeAssetId", "startTime", "status", "userId") SELECT "endTime", "id", "snipeAssetId", "startTime", "status", "userId" FROM "reservations";
DROP TABLE "reservations";
ALTER TABLE "new_reservations" RENAME TO "reservations";
CREATE INDEX "reservations_userId_category_startTime_endTime_idx" ON "reservations"("userId", "category", "startTime", "endTime");
CREATE INDEX "reservations_snipeAssetId_startTime_endTime_idx" ON "reservations"("snipeAssetId", "startTime", "endTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
