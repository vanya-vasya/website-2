# Payments & Token Top-ups System - Complete Archive

## ✅ Task Completed Successfully

All payment and token top-up related files have been identified, copied, and documented.

## 📊 Archive Contents

### Files Copied: 25 total

#### API Routes (4 files)
- `payment/networx/route.ts` - Payment checkout creation & status check (227 lines)
- `webhooks/networx/route.ts` - PRIMARY webhook handler (340 lines)
- `webhooks/payment/route.ts` - Legacy webhook (186 lines)
- `webhooks/clerk/route.ts` - User auth events (137 lines)

#### Database (4 files)
- `prisma/schema.prisma` - User & Transaction models (37 lines)
- `prisma/migrations/20240523115036_create_table/migration.sql`
- `prisma/migrations/20250123151835_add_20_gen/migration.sql`
- `prisma/migrations/20250123152000_add_transactions/migration.sql`

#### Components (5 files)
- `components/pro-modal.tsx` - Payment modal (375 lines)
- `components/buy-generations.tsx` - Buy button (24 lines)
- `components/free-counter.tsx` - Token counter (50 lines)
- `components/pdf/receipt.tsx` - PDF receipt template (254 lines)
- `components/landing/pricing.tsx` - Pricing page (337 lines)

#### Business Logic (3 files)
- `lib/receiptGeneration.tsx` - PDF generator (28 lines)
- `lib/api-limit.ts` - Token management (150 lines)
- `lib/actions/user.actions.ts` - User CRUD (166 lines)

#### Configuration (3 files)
- `config/nodemailer.ts` - Email setup (19 lines)
- `constants.ts` - Pricing & tool costs (407 lines)
- `constants/index.ts` - Currencies & rates (256 lines)

#### UI Pages (2 files)
- `dashboard_billing/payment-history/page.tsx` (188 lines)
- `dashboard_billing/payment-history/payment-history-client.tsx`

#### Documentation (4 files)
- `docs/NETWORX_ENV_SETUP.md` - NetworkX configuration
- `docs/ENV_SETUP.md` - General environment setup
- `README.md` - Quick overview
- `SUMMARY.md` - This file

## 🎯 Database Sinks Identified

### User Table (`prisma/schema.prisma`)
**Tracks token balances for each user**:
- `availableGenerations` INT - Total tokens available
- `usedGenerations` INT - Tokens consumed
- **Net Balance** = availableGenerations - usedGenerations

**Database Write Locations**:
1. **`webhooks/networx/route.ts:194-200`** - Updates balance after payment
2. **`lib/actions/user.actions.ts:30-40`** - Creates users with 10 free tokens
3. **`lib/api-limit.ts:19-23`** - Deducts tokens when using features

### Transaction Table (`prisma/schema.prisma`)
**Records all payment transactions**:
- `tracking_id` STRING - Unique transaction ID
- `userId` STRING - User Clerk ID  
- `amount` INT - Payment amount in cents
- `currency` STRING - Currency code
- `status` STRING - Payment status
- `description` STRING - Includes token count
- `paid_at` DATETIME - Payment timestamp
- `receipt_url` STRING - PDF receipt URL

**Database Write Locations**:
1. **`webhooks/networx/route.ts:218-221`** - PRIMARY: Creates transaction after payment
2. **`webhooks/payment/route.ts:94-108`** - LEGACY: Alternative webhook

## 💳 Payment Flow

```
User → Pro Modal → Payment API → NetworkX → Webhook → Database Update → Email Receipt
```

1. User clicks "Buy More" button
2. `pro-modal.tsx` opens with token selector
3. User submits → `/api/payment/networx` (POST)
4. API creates checkout session with NetworkX
5. User redirected to NetworkX hosted payment page
6. User completes payment
7. NetworkX sends webhook to `/api/webhooks/networx`
8. Webhook verifies signature & processes:
   - Updates `User.availableGenerations`
   - Creates `Transaction` record
   - Generates PDF receipt
   - Sends email with receipt
9. User redirected to `/dashboard`

## 💰 Pricing Structure

**Base Rate**: £0.20 per token (GBP)

**Packages**:
- Tracker: £20 / 100 tokens
- Master Chef: £40 / 220 tokens (10% discount)
- Master Nutritionist: £60 / 360 tokens (20% discount)
- Custom Amount: Variable at £0.20/token

**Token Costs per Feature**:
- Conversation: 1 token
- Image Generation: 14 tokens
- Image Restore: 11 tokens
- Background Removal: 17 tokens
- Generative Fill: 20 tokens
- Object Recolor: 16 tokens
- Object Remove: 28 tokens
- Music: 11 tokens
- Speech: 13 tokens
- Code: 5 tokens

## 🔐 Security Features

✅ HMAC SHA256 webhook signature verification  
✅ Idempotency checks (prevents duplicate charges)  
✅ Server-side price calculation  
✅ Secure environment variables  
✅ Database foreign key constraints  
✅ Test mode for development  

## 📧 Email System

**SMTP Provider**: Titan Email (smtp.titan.email:465)

**Sent On Payment**:
- Transaction confirmation
- PDF receipt attachment
- Company contact info

## 🛠️ Technology Stack

- Next.js 14+ (App Router)
- PostgreSQL (Prisma ORM)
- NetworkX Pay (Payment Gateway)
- Clerk (Authentication)
- Nodemailer (SMTP)
- @react-pdf/renderer (PDFs)
- Zod + react-hook-form (Forms)
- Framer Motion (Animations)

## 📦 Dependencies Required

```json
{
  "@clerk/nextjs": "^4.29.0",
  "@prisma/client": "^5.9.0",
  "@react-pdf/renderer": "^3.1.15",
  "nodemailer": "^6.9.8",
  "zod": "^3.22.4",
  "react-hook-form": "^7.49.3",
  "framer-motion": "^11.0.3",
  "axios": "^1.6.5"
}
```

## 📋 Quick Setup

1. Copy all files to your project
2. Install dependencies
3. Configure environment variables:
   - `DATABASE_URL`
   - `NETWORX_SHOP_ID`
   - `NETWORX_SECRET_KEY`
   - SMTP credentials
   - Clerk keys
4. Run migrations: `npx prisma migrate deploy`
5. Update domain references in API routes
6. Configure webhooks in NetworkX dashboard
7. Test with test cards
8. Deploy to production

## 🔍 Query Examples

### Get User Balance
\`\`\`typescript
const user = await prismadb.user.findUnique({
  where: { clerkId: userId },
  select: { availableGenerations: true, usedGenerations: true }
});
const balance = user.availableGenerations - user.usedGenerations;
\`\`\`

### Get Transaction History
\`\`\`typescript
const transactions = await prismadb.transaction.findMany({
  where: { userId: clerkId },
  orderBy: { paid_at: 'desc' }
});
\`\`\`

### Get Revenue by Currency
\`\`\`sql
SELECT 
  SUM(amount) / 100 as total,
  COUNT(*) as count,
  currency
FROM Transaction
WHERE status = 'successful'
GROUP BY currency;
\`\`\`

## 📞 Support

**Original Source**: yum-mi.com  
**Company**: QUICK FIT LTD (Company #15995367)  
**Email**: support@yum-mi.com  
**Address**: DEPT 2, 43 OWSTON ROAD, CARCROFT, DONCASTER, UK, DN6 8DA

## ✅ Verification Checklist

- [x] All payment API routes identified and copied
- [x] All webhook handlers identified and copied
- [x] Database schema and migrations copied
- [x] Frontend components copied
- [x] Business logic files copied
- [x] Configuration files copied
- [x] Documentation files copied
- [x] Database sinks documented
- [x] Payment flow documented
- [x] Pricing structure documented
- [x] Security features documented

## 📈 Statistics

- **Total Files**: 25
- **Total Lines**: ~3,200+ (code only)
- **Archive Size**: 176 KB
- **Languages**: TypeScript, TSX, SQL, Prisma
- **Time to Setup**: 2-3 hours (estimated)

---

**Archive Version**: 1.0  
**Generated**: October 24, 2025  
**Status**: ✅ Complete and Ready for Import

For detailed setup instructions, see README.md in this folder.
