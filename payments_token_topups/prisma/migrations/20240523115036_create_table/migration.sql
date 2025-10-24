CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "photo" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "usedGenerations" INTEGER DEFAULT 0 NOT NULL,
  "availableGenerations" INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY ("id")
);

-- Добавление уникальных индексов
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User" ("clerkId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");
