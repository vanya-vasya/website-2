import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";

export interface Transaction {
  id: string;
  tracking_id: string;
  userId: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  description: string | null;
  type: string | null;
  payment_method_type: string | null;
  message: string | null;
  paid_at: Date | null;
  receipt_url: string | null;
  createdAt: Date;
  reason: string | null;
  webhookEventId: string | null;
}

export const incrementApiLimit = async (value: number) => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const result = await db.query(
    'SELECT "usedGenerations" FROM "User" WHERE "clerkId" = $1',
    [userId]
  );

  if (result.rows.length > 0) {
    const currentUsed = result.rows[0].usedGenerations;
    await db.query(
      'UPDATE "User" SET "usedGenerations" = $1 WHERE "clerkId" = $2',
      [currentUsed + value, userId]
    );
  }
};

export const checkApiLimit = async (generationPrice: number) => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const result = await db.query(
    'SELECT "usedGenerations", "availableGenerations" FROM "User" WHERE "clerkId" = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const user = result.rows[0];
  const remainingGenerations = user.availableGenerations - user.usedGenerations;

  return remainingGenerations >= generationPrice;
};

export const getApiAvailableGenerations = async () => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  const result = await db.query(
    'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return result.rows[0].availableGenerations;
};

export const getApiUsedGenerations = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return 0;
  }

  const result = await db.query(
    'SELECT "usedGenerations" FROM "User" WHERE "clerkId" = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return 0;
  }

  return result.rows[0].usedGenerations;
};

export async function fetchPaymentHistory(): Promise<Transaction[] | null> {
  try {
    const { userId } = auth();

    if (!userId) {
      return null;
    }

    const result = await db.query<Transaction>(
      'SELECT * FROM "Transaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error("[FETCH_PAYMENT_HISTORY_ERROR]", error);
    return null;
  }
}
