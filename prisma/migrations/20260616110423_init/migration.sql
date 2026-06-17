-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "CustomerDiscount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    CONSTRAINT "CustomerDiscount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hargaModal" REAL NOT NULL,
    "hargaJual" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Bon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorBon" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "ongkir" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Piutang',
    "lunasDate" DATETIME,
    CONSTRAINT "Bon_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BonItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bonId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "hargaModal" REAL NOT NULL,
    "hargaJual" REAL NOT NULL,
    "diskonCascading" TEXT NOT NULL,
    "hargaSetelahDiskon" REAL NOT NULL,
    CONSTRAINT "BonItem_bonId_fkey" FOREIGN KEY ("bonId") REFERENCES "Bon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BonItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_name_key" ON "Customer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscount_customerId_type_key" ON "CustomerDiscount"("customerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Bon_nomorBon_key" ON "Bon"("nomorBon");
