-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorBon" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "ongkir" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Piutang',
    "isBonus" BOOLEAN NOT NULL DEFAULT false,
    "consumedBonus" INTEGER NOT NULL DEFAULT 0,
    "lunasDate" DATETIME,
    CONSTRAINT "Bon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bon" ("customerId", "date", "id", "lunasDate", "nomorBon", "ongkir", "status") SELECT "customerId", "date", "id", "lunasDate", "nomorBon", "ongkir", "status" FROM "Bon";
DROP TABLE "Bon";
ALTER TABLE "new_Bon" RENAME TO "Bon";
CREATE UNIQUE INDEX "Bon_nomorBon_key" ON "Bon"("nomorBon");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
