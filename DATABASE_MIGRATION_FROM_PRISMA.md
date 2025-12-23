# Database Migration: Prisma to Native PostgreSQL

**Date:** October 24, 2025  
**Status:** ✅ **COMPLETE**

---

## Summary

Successfully removed Prisma ORM from the project and migrated to native PostgreSQL client (`pg`). The database schema was reset to a clean state and all database operations now use raw SQL queries through a connection pool.

---

## What Was Changed

### 1. **Removed Prisma**
- ✅ Deleted `prisma/` directory (schema, migrations)
- ✅ Deleted `lib/prismadb.ts`
- ✅ Removed `@prisma/client` and `prisma` packages from `package.json`
- ✅ Removed all Prisma-related scripts from `package.json`

### 2. **New Database Client**
- ✅ Created `lib/db.ts` - Native PostgreSQL connection pool using `pg` library
- ✅ Added `pg` and `@types/pg` packages
- ✅ Implemented transaction support
- ✅ Added connection pooling (max 20 connections)
- ✅ Built-in query logging for development

### 3. **Database Schema**
- ✅ Created `db/schema.sql` - Complete PostgreSQL schema definition
- ✅ Created `scripts/setup-database.ts` - Database setup script
- ✅ Dropped and recreated all tables with clean schema:
  - `User` table
  - `Transaction` table
  - `WebhookEvent` table
- ✅ Added indexes for performance
- ✅ Created auto-update trigger for `updatedAt` column

### 4. **Updated Code Files**
All files updated to use new `db` client:
- ✅ `lib/api-limit.ts` - Credit/generation management
- ✅ `lib/actions/user.actions.ts` - User CRUD operations
- ✅ `app/api/webhooks/clerk/route.ts` - User signup webhook
- ✅ `app/api/webhooks/networx/route.ts` - Payment webhook
- ✅ `app/api/payment/verify-balance/route.ts` - Balance verification
- ✅ `app/api/generations/route.ts` - Generation API

---

## Database Setup

### Prerequisites
- Neon PostgreSQL database (or any PostgreSQL database)
- `DATABASE_URL` environment variable set

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Setup database schema:**
```bash
npm run db:setup
```

This will:
- Drop existing tables if they exist
- Create all tables with proper schema
- Create indexes for performance
- Set up triggers for auto-updating timestamps

---

## Database Connection

The new database client (`lib/db.ts`) provides:

```typescript
import db from '@/lib/db';

// Simple query
const result = await db.query('SELECT * FROM "User" WHERE "clerkId" = $1', [userId]);

// Transaction
await db.transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});

// Generate ID
const id = db.generateId();
```

### Features
- **Connection Pooling**: Max 20 connections, 30s idle timeout
- **SSL**: Enabled with `rejectUnauthorized: false` for Neon
- **Logging**: Query logging in development mode
- **Error Handling**: Automatic error logging
- **Transactions**: Full ACID transaction support

---

## Database Schema

### User Table
```sql
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "clerkId" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "photo" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "usedGenerations" INTEGER NOT NULL DEFAULT 0,
    "availableGenerations" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Transaction Table
```sql
CREATE TABLE "Transaction" (
    "id" TEXT PRIMARY KEY,
    "tracking_id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "description" TEXT,
    "type" TEXT,
    "payment_method_type" TEXT,
    "message" TEXT,
    "paid_at" TIMESTAMP,
    "receipt_url" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "webhookEventId" TEXT UNIQUE
);
```

### WebhookEvent Table
```sql
CREATE TABLE "WebhookEvent" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT UNIQUE NOT NULL,
    "eventType" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Environment Variables

Required environment variable:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

For Neon:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

---

## Migration Guide for New Features

When adding new database operations:

### 1. Simple Query
```typescript
import db from '@/lib/db';

const users = await db.query(
  'SELECT * FROM "User" WHERE "email" = $1',
  [email]
);
```

### 2. Insert with Generated ID
```typescript
const id = db.generateId();
await db.query(
  'INSERT INTO "User" ("id", "clerkId", "email", ...) VALUES ($1, $2, $3, ...)',
  [id, clerkId, email, ...]
);
```

### 3. Update
```typescript
await db.query(
  'UPDATE "User" SET "availableGenerations" = $1 WHERE "clerkId" = $2',
  [newBalance, userId]
);
```

### 4. Transaction (Multiple Operations)
```typescript
await db.transaction(async (client) => {
  // All operations succeed or all rollback
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  await client.query('DELETE FROM ...');
});
```

---

## Testing

### Local Testing
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Setup (Reset)
```bash
npm run db:setup
```

---

## Vercel Deployment

Update build command in Vercel:

**Before:**
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**After:**
```json
"build": "next build"
```

The database schema should be set up manually using the `db:setup` script before deploying, or run it once in Vercel using:

```bash
npm run db:setup
```

---

## Breaking Changes

### For Developers

1. **No more Prisma Client**: All database operations use raw SQL
2. **No auto-generated types**: Define TypeScript interfaces manually
3. **No migrations**: Schema changes done via `db/schema.sql`
4. **Manual ID generation**: Use `db.generateId()` for new records

### Type Definitions

Example type definitions (already added to files):

```typescript
export interface User {
  id: string;
  clerkId: string;
  email: string;
  photo: string;
  firstName: string | null;
  lastName: string | null;
  usedGenerations: number;
  availableGenerations: number;
  createdAt: Date;
  updatedAt: Date;
}

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
```

---

## Benefits

✅ **No ORM overhead** - Direct PostgreSQL queries are faster  
✅ **Full SQL control** - Write optimized queries  
✅ **Smaller bundle** - Removed ~7MB of dependencies  
✅ **Simpler deployment** - No migration steps needed  
✅ **Better debugging** - See exact SQL queries in logs  
✅ **Clean database** - Fresh start with proper schema  

---

## Support

For issues or questions:
1. Check database connection via `npm run db:setup`
2. Verify `DATABASE_URL` is set correctly
3. Check Neon console for connection limits
4. Review query logs in development mode

---

**Migration completed successfully!** 🎉

