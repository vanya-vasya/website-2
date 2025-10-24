-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "description" TEXT,
    "type" TEXT,
    "payment_method_type" TEXT,
    "message" TEXT,
    "paid_at" TIMESTAMP(3),
    "receipt_url" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
