import { Pool } from 'pg';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { POST } from '@/app/api/webhooks/secure-processor/route';

const hasDb = !!process.env.DATABASE_URL;
const describeDb = hasDb ? describe : describe.skip;

describeDb('Secure-processor Webhook Integration Tests (DB)', () => {
  let pool: Pool;
  const secretKey = 'test_webhook_secret_key';
  const testClerkId = `test_secure_processor_user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const testEmail = `secure-processor-test-${Date.now()}@example.com`;

  const createWebhookSignature = (payload: Record<string, any>) => {
    const source = payload?.transaction && typeof payload.transaction === 'object' ? payload.transaction : payload;
    const params: Record<string, string> = {};

    for (const [key, value] of Object.entries(source)) {
      if (key === 'signature') continue;
      if (value === undefined || value === null) continue;
      if (typeof value === 'object') continue;
      params[key] = String(value);
    }

    const customer = source.customer && typeof source.customer === 'object' ? source.customer : null;
    if (customer?.email && typeof customer.email === 'string') params.customer_email = customer.email;
    if (customer?.ip && typeof customer.ip === 'string') params.customer_ip = customer.ip;

    const signString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return crypto.createHmac('sha256', secretKey).update(signString).digest('hex');
  };

  const createWebhookRequest = (payload: Record<string, any>, signature: string) =>
    new NextRequest('http://localhost/api/webhooks/secure-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

  beforeAll(async () => {
    process.env.SECURE_PROCESSOR_SECRET_KEY = secretKey;

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await pool.query(
      `INSERT INTO "User" ("id", "clerkId", "email", "photo", "firstName", "lastName", "availableGenerations", "usedGenerations")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        `user_${Date.now()}`,
        testClerkId,
        testEmail,
        'https://example.com/photo.jpg',
        'Secure',
        'Processor',
        20,
        5,
      ]
    );
  });

  afterAll(async () => {
    await pool.query('DELETE FROM "Transaction" WHERE "userId" = $1', [testClerkId]);
    await pool.query('DELETE FROM "WebhookEvent" WHERE "eventId" LIKE $1', [`%:${testClerkId}:%`]);
    await pool.query('DELETE FROM "User" WHERE "clerkId" = $1', [testClerkId]);
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM "Transaction" WHERE "userId" = $1', [testClerkId]);
    await pool.query('DELETE FROM "WebhookEvent" WHERE "eventId" LIKE $1', [`%:${testClerkId}:%`]);
  });

  it('verifies signature (header) and credits tokens once on successful payment', async () => {
    const uid = `txn_sig_${Date.now()}`;
    const paidAt = new Date().toISOString();

    const payload = {
      transaction: {
        test: false,
        uid,
        status: 'successful',
        amount: '10.00',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Nerbixa Generations Purchase (100 Tokens)',
        payment_method_type: 'card',
        message: 'Payment successful',
        paid_at: paidAt,
        customer: { email: testEmail },
      },
    };

    const signature = createWebhookSignature(payload);
    const response = await POST(createWebhookRequest(payload, signature));

      expect(response.status).toBe(200);

    const txn = await pool.query('SELECT * FROM "Transaction" WHERE "webhookEventId" = $1', [uid]);
    expect(txn.rows.length).toBe(1);
    expect(txn.rows[0].status).toBe('successful');
    expect(txn.rows[0].userId).toBe(testClerkId);
    expect(txn.rows[0].amount).toBe(1000);

    const user = await pool.query(
      'SELECT "availableGenerations", "usedGenerations" FROM "User" WHERE "clerkId" = $1',
      [testClerkId]
    );
    // 20 available - 5 used = 15, + 100 = 115; used resets to 0 on top-up
    expect(user.rows[0].availableGenerations).toBe(115);
    expect(user.rows[0].usedGenerations).toBe(0);
  });

  it('handles pending → successful transition for same uid and credits on success (no dropped update)', async () => {
    const uid = `txn_transition_${Date.now()}`;
    const paidAtPending = new Date(Date.now() - 5000).toISOString();
    const paidAtSuccess = new Date().toISOString();

    const base = {
      test: false,
      uid,
      amount: 250,
      currency: 'EUR',
        type: 'payment',
        tracking_id: testClerkId,
      description: 'Token Top-up (50 Tokens)',
      payment_method_type: 'credit_card',
      message: 'Payment update',
      customer: { email: testEmail },
    };

    const pendingPayload = { transaction: { ...base, status: 'pending', paid_at: paidAtPending } };
    const successPayload = { transaction: { ...base, status: 'successful', paid_at: paidAtSuccess } };

    const pendingSig = createWebhookSignature(pendingPayload);
    const successSig = createWebhookSignature(successPayload);

    const res1 = await POST(createWebhookRequest(pendingPayload, pendingSig));
    expect(res1.status).toBe(200);

    const res2 = await POST(createWebhookRequest(successPayload, successSig));
    expect(res2.status).toBe(200);

    const txn = await pool.query('SELECT * FROM "Transaction" WHERE "webhookEventId" = $1', [uid]);
    expect(txn.rows.length).toBe(1);
    expect(txn.rows[0].status).toBe('successful');

    const user = await pool.query(
      'SELECT "availableGenerations", "usedGenerations" FROM "User" WHERE "clerkId" = $1',
      [testClerkId]
    );
    // After first test, user is 115/0. Transition adds +50 → 165/0.
    expect(user.rows[0].availableGenerations).toBe(165);
    expect(user.rows[0].usedGenerations).toBe(0);
  });

  it('is idempotent for exact duplicate successful event (same uid/status/paid_at) and does not double-credit', async () => {
    const uid = `txn_dup_${Date.now()}`;
    const paidAt = new Date().toISOString();

    const payload = {
      transaction: {
        test: false,
        uid,
        status: 'successful',
        amount: 250,
        currency: 'EUR',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Token Top-up (50 Tokens)',
        payment_method_type: 'credit_card',
        message: 'Payment successful',
        paid_at: paidAt,
        customer: { email: testEmail },
      },
    };

    const signature = createWebhookSignature(payload);
    const res1 = await POST(createWebhookRequest(payload, signature));
    expect(res1.status).toBe(200);

    const userAfterFirst = await pool.query(
      'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
      [testClerkId]
    );

    const res2 = await POST(createWebhookRequest(payload, signature));
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.idempotent).toBe(true);

    const userAfterSecond = await pool.query(
      'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
      [testClerkId]
    );
    expect(userAfterSecond.rows[0].availableGenerations).toBe(userAfterFirst.rows[0].availableGenerations);
  });

  it('does not poison idempotency on validation failure (retry after 400 should process)', async () => {
    const uid = `txn_retry_${Date.now()}`;
    const paidAt = new Date().toISOString();

    const badPayload = {
      transaction: {
        test: false,
        uid,
        status: 'successful',
        amount: '10.00',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Invalid description without token info',
        payment_method_type: 'card',
        message: 'Payment successful',
        paid_at: paidAt,
        customer: { email: testEmail },
      },
    };

    const badSig = createWebhookSignature(badPayload);
    const res1 = await POST(createWebhookRequest(badPayload, badSig));
    expect(res1.status).toBe(400);

    const goodPayload = {
      transaction: {
        ...badPayload.transaction,
        description: 'Nerbixa Generations Purchase (100 Tokens)',
      },
    };

    const goodSig = createWebhookSignature(goodPayload);
    const res2 = await POST(createWebhookRequest(goodPayload, goodSig));
    expect(res2.status).toBe(200);

    const txn = await pool.query('SELECT * FROM "Transaction" WHERE "webhookEventId" = $1', [uid]);
    expect(txn.rows.length).toBe(1);
    expect(txn.rows[0].status).toBe('successful');
  });
});


