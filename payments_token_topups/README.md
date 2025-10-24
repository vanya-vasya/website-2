# Payment & Token Top-ups System Archive

Complete implementation of a token-based payment system with NetworkX Pay integration, extracted from the yum-mi project.

## 📦 What's Inside

This archive contains **all files** necessary to implement a production-ready payment system with:

✅ Token-based credit management  
✅ Multi-currency support (15+ currencies)  
✅ Automated PDF receipt generation  
✅ Email confirmations with attachments  
✅ Payment history tracking  
✅ Webhook signature verification  
✅ Idempotency protection  
✅ Test/Production mode switching  

## 📋 Quick Start

1. **Read the reports first**:
   - `REPORT.md` - System analysis & data sink documentation
   - `PAYMENTS_SETUP_REPORT.md` - Complete setup guide with code examples

2. **Review the file inventory**:
   - `FILE_INVENTORY.md` - Detailed list of all 25 files with descriptions

3. **Follow the import instructions** in `PAYMENTS_SETUP_REPORT.md`

## 📊 Database Sinks

### User Table
**Tracks token balances**:
- `availableGenerations` - Total tokens available
- `usedGenerations` - Tokens consumed
- **Net Balance**: `availableGenerations - usedGenerations`

**Write Paths**:
- `webhooks/networx/route.ts:194-200` - Updates after successful payment
- `lib/actions/user.actions.ts:30-40` - Creates new users with 10 free tokens
- `lib/api-limit.ts:19-23` - Deducts tokens when using AI features

### Transaction Table
**Records all payments**:
- `tracking_id` - Unique transaction identifier
- `userId` - User who made payment (Clerk ID)
- `amount` - Payment amount in cents
- `currency` - Currency code (GBP, USD, EUR, etc.)
- `status` - Payment status (successful, failed, pending, etc.)
- `description` - Payment description (includes token count)
- `paid_at` - Payment timestamp

**Write Paths**:
- `webhooks/networx/route.ts:218-221` - Creates transaction record after payment
- `webhooks/payment/route.ts:94-108` - Legacy webhook handler

## 🗂️ Directory Structure

```
payments_token_topups/
├── README.md                    ⬅️ You are here
├── REPORT.md                    📊 System analysis
├── PAYMENTS_SETUP_REPORT.md     📖 Complete setup guide
├── FILE_INVENTORY.md            📋 Detailed file list
├── QUICK_SETUP_CHECKLIST.md     ✅ Step-by-step checklist
├── payment/                     💳 Payment API routes
├── webhooks/                    🔔 Webhook handlers
├── prisma/                      🗄️ Database schema & migrations
├── components/                  🎨 React UI components
├── lib/                         📚 Business logic
├── config/                      ⚙️ Configuration files
├── constants/                   📐 Constants & pricing
├── dashboard_billing/           📈 Payment history UI
└── docs/                        📝 Setup documentation
```

## 💰 Pricing Model

### Base Rate
**£0.20 per token** (GBP)

### Preset Packages
| Package | Price | Tokens | Discount |
|---------|-------|--------|----------|
| Tracker | £20 | 100 | Standard |
| Master Chef | £40 | 220 | 10% off |
| Master Nutritionist | £60 | 360 | 20% off |

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Payment Gateway**: NetworkX Pay
- **Authentication**: Clerk
- **Email**: Nodemailer (SMTP)
- **PDF**: @react-pdf/renderer

## 📚 Documentation Files

1. **REPORT.md** - Comprehensive system analysis
2. **PAYMENTS_SETUP_REPORT.md** - Complete setup guide
3. **FILE_INVENTORY.md** - Detailed file listing
4. **QUICK_SETUP_CHECKLIST.md** - Step-by-step setup
5. **docs/NETWORX_ENV_SETUP.md** - NetworkX configuration
6. **docs/ENV_SETUP.md** - General environment setup

---

**Version**: 1.0  
**Generated**: October 24, 2025  
**Source**: yum-mi.com payment system  

For detailed implementation instructions, see **PAYMENTS_SETUP_REPORT.md**.

