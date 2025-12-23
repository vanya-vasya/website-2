#!/usr/bin/env node
/**
 * Secure-processor Reconciliation Import
 *
 * Usage:
 *   node scripts/reconcile-secure-processor-export.js --file ./export.json [--live]
 *
 * export.json can be:
 * - JSON array of objects
 * - NDJSON (one JSON object per line) if file ends with .ndjson
 *
 * Each record should include:
 * - uid (operation number / transaction uid)
 * - tracking_id (Clerk user id)
 * - status (successful/success/failed/pending/canceled/refunded)
 * - amount (number or string; either cents int or decimal)
 * - currency
 * - description (must contain "(N Tokens)")
 * - paid_at (ISO)
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const args = process.argv.slice(2);
const getArgValue = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] || null;
};

const filePath = getArgValue("--file");
const isLive = args.includes("--live");

if (!filePath) {
  console.error("Missing --file");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const extractTokensFromDescription = (description) => {
  if (!description || typeof description !== "string") return null;
  const match = description.match(/\((\d+)\s+Tokens?\)/i);
  return match ? Number.parseInt(match[1], 10) : null;
};

const normalizeAmountToInt = (rawAmount) => {
  if (rawAmount === null || rawAmount === undefined) return null;

  if (typeof rawAmount === "number") {
    if (!Number.isFinite(rawAmount)) return null;
    return Number.isInteger(rawAmount) ? rawAmount : Math.round(rawAmount * 100);
  }

  if (typeof rawAmount === "string") {
    const trimmed = rawAmount.trim();
    if (!trimmed) return null;
    if (trimmed.includes(".")) {
      const parsed = Number.parseFloat(trimmed);
      if (!Number.isFinite(parsed)) return null;
      return Math.round(parsed * 100);
    }
    const parsedInt = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsedInt) ? parsedInt : null;
  }

  return null;
};

const readRecords = () => {
  const abs = path.resolve(process.cwd(), filePath);
  const contents = fs.readFileSync(abs, "utf8");
  if (abs.endsWith(".ndjson")) {
    return contents
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  }

  const parsed = JSON.parse(contents);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.records)) return parsed.records;
  throw new Error("Unsupported JSON format. Expected an array or { records: [] }.");
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 15);
  return `${timestamp}${randomPart}`;
};

const normalizeStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "success") return "successful";
  return s;
};

const main = async () => {
  const records = readRecords();
  console.log(`Loaded ${records.length} record(s) from ${filePath}`);
  console.log(`Mode: ${isLive ? "LIVE" : "DRY RUN"}`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const rec of records) {
    const uid = rec.uid || rec.transaction_id || rec.webhookEventId;
    const trackingId = rec.tracking_id || rec.userId || rec.clerkId;
    const status = normalizeStatus(rec.status);
    const paidAt = rec.paid_at || rec.paidAt || null;
    const currency = rec.currency || "USD";
    const description = rec.description || "";
    const amount = normalizeAmountToInt(rec.amount);

    if (!uid || !trackingId) {
      console.warn("Skipping record missing uid or tracking_id:", { uid, trackingId });
      skipped++;
      continue;
    }

    const tokensToAdd = extractTokensFromDescription(description);
    if ((status === "successful" || status === "refunded") && !tokensToAdd) {
      console.warn("Skipping record with unparseable description:", { uid, description });
      skipped++;
      continue;
    }

    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const existingTxn = await client.query(
          'SELECT "status", "userId" FROM "Transaction" WHERE "webhookEventId" = $1 FOR UPDATE',
          [uid]
        );

        const existingStatus = existingTxn.rows[0]?.status || null;
        const alreadySuccessful = existingStatus === "successful";

        if (!isLive) {
          console.log("[DRY] Would reconcile:", { uid, trackingId, status, existingStatus });
          await client.query("ROLLBACK");
          processed++;
          continue;
        }

        // Upsert transaction status
        if (existingTxn.rows.length === 0) {
          await client.query(
            `INSERT INTO "Transaction"
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
               "type", "payment_method_type", "message", "paid_at", "webhookEventId")
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'payment', 'card', $8, $9, $10)`,
            [
              generateId(),
              uid,
              trackingId,
              status,
              amount,
              currency,
              description,
              `Reconciled import (${status})`,
              paidAt ? new Date(paidAt) : new Date(),
              uid,
            ]
          );
        } else {
          await client.query(
            `UPDATE "Transaction"
             SET "status" = $2,
                 "amount" = COALESCE($3, "amount"),
                 "currency" = COALESCE($4, "currency"),
                 "description" = COALESCE($5, "description"),
                 "paid_at" = COALESCE($6, "paid_at")
             WHERE "webhookEventId" = $1`,
            [uid, status, amount, currency, description || null, paidAt ? new Date(paidAt) : null]
          );
        }

        // Credit user only when transitioning to successful and not already successful
        if (status === "successful" && !alreadySuccessful) {
          const userRes = await client.query(
            'SELECT "availableGenerations", "usedGenerations" FROM "User" WHERE "clerkId" = $1 FOR UPDATE',
            [trackingId]
          );
          if (userRes.rows.length === 0) {
            console.warn("User missing, transaction recorded but no credit:", { uid, trackingId });
          } else {
            const u = userRes.rows[0];
            const newAvail = u.availableGenerations - u.usedGenerations + tokensToAdd;
            await client.query(
              'UPDATE "User" SET "availableGenerations" = $1, "usedGenerations" = 0 WHERE "clerkId" = $2',
              [newAvail, trackingId]
            );
          }
        }

        await client.query("COMMIT");
        processed++;
      } catch (err) {
        await client.query("ROLLBACK");
        failed++;
        console.error("Failed record:", { uid, trackingId, status, err: err?.message || String(err) });
      } finally {
        client.release();
      }
    } catch (err) {
      failed++;
      console.error("DB connect failed:", err?.message || String(err));
    }
  }

  console.log("\nSummary:", { processed, skipped, failed });
  console.log(isLive ? "✅ LIVE reconcile complete" : "🔍 DRY RUN complete (use --live to apply)");
};

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });


