-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snipeItUserId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weekQuotaUsed" INTEGER NOT NULL,
    "hasOutstandingBalance" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetTag" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snipeAssetId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assetType" TEXT NOT NULL DEFAULT 'Unknown',
    CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_snipeAssetId_fkey" FOREIGN KEY ("snipeAssetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dateIssued" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "fines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blackout_dates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "reason" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "semester" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserCourse" (
    "user_id" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "course_id"),
    CONSTRAINT "UserCourse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetCourse" (
    "asset_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,

    PRIMARY KEY ("asset_id", "course_id"),
    CONSTRAINT "AssetCourse_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssetCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_snipeItUserId_key" ON "User"("snipeItUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "blackout_dates_date_key" ON "blackout_dates"("date");
