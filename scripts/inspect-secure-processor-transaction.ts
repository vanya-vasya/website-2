#!/usr/bin/env ts-node
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uid = process.argv[2];
if (!uid) {
  // eslint-disable-next-line no-console
  console.error('Usage: ts-node scripts/inspect-secure-processor-transaction.ts <uid>');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const main = async () => {
  // eslint-disable-next-line no-console
  console.log('🔎 Inspecting secure-processor transaction');
  // eslint-disable-next-line no-console
  console.log('UID/webhookEventId:', uid);
  // eslint-disable-next-line no-console
  console.log('');

  const txn = await pool.query('SELECT * FROM "Transaction" WHERE "webhookEventId" = $1', [uid]);
  // eslint-disable-next-line no-console
  console.log('Transaction rows:', txn.rows.length);
  if (txn.rows[0]) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(txn.rows[0], null, 2));
  }

  // Event rows for this uid
  const ev = await pool.query(
    'SELECT * FROM "WebhookEvent" WHERE "eventId" LIKE $1 ORDER BY "createdAt" DESC',
    [`${uid}:%`]
  );
  // eslint-disable-next-line no-console
  console.log('\nWebhookEvent rows:', ev.rows.length);
  if (ev.rows.length > 0) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(ev.rows, null, 2));
  }

  const userId = txn.rows[0]?.userId;
  if (userId) {
    const user = await pool.query(
      'SELECT "clerkId", "email", "availableGenerations", "usedGenerations", "updatedAt" FROM "User" WHERE "clerkId" = $1',
      [userId]
    );
    // eslint-disable-next-line no-console
    console.log('\nUser rows:', user.rows.length);
    if (user.rows[0]) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(user.rows[0], null, 2));
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('\nNo userId on Transaction row (or transaction missing).');
  }

  // Helpful nearby transactions
  const nearby = await pool.query(
    `SELECT "id", "webhookEventId", "userId", "status", "amount", "currency", "createdAt"
     FROM "Transaction"
     WHERE "createdAt" > NOW() - INTERVAL '7 days'
     ORDER BY "createdAt" DESC
     LIMIT 20`
  );
  // eslint-disable-next-line no-console
  console.log('\nRecent 20 transactions (last 7 days):');
  // eslint-disable-next-line no-console
  console.table(
    nearby.rows.map((r) => ({
      id: r.id,
      webhookEventId: r.webhookEventId,
      userId: r.userId,
      status: r.status,
      amount: r.amount,
      currency: r.currency,
      createdAt: r.createdAt,
    }))
  );
};

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });


