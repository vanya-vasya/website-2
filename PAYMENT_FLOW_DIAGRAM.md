# Payment Redirect Flow Diagram

## Complete Payment and Redirect Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INITIATES PAYMENT                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  User clicks "Buy Tokens" in Pro Modal                              │
│  → Modal shows NetworkPaymentWidget                                 │
│  → Widget calls: POST /api/payment/secure-processor                          │
│     Body: { amount, currency, orderId, userId, customerEmail }      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Payment API Creates Checkout Session                               │
│  → Validates userId and orderId                                     │
│  → Creates requestData with:                                        │
│     • tracking_id: userId (for webhook matching)                    │
│     • return_url: /payment/success?order_id={orderId}              │
│  → Sends to Secure-processor Payment Gateway                                 │
│  → Returns: { token, payment_url }                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  User Redirected to Secure-processor Hosted Payment Page                     │
│  → User enters card details                                         │
│  → Secure-processor processes payment                                        │
│  → 3D Secure verification (if required)                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌─────────────────────────────┐
    │   PAYMENT SUCCESSFUL      │   │   PAYMENT FAILED/CANCELLED  │
    └───────────────────────────┘   └─────────────────────────────┘
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌─────────────────────────────┐
    │  Redirect to Success Page │   │  Redirect to Cancel Page    │
    │  /payment/success?        │   │  /payment/cancel?           │
    │    order_id={orderId}     │   │    order_id={orderId}       │
    └───────────────────────────┘   └─────────────────────────────┘
                    │
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌──────────────────┐   ┌────────────────────────────────┐
│  WEBHOOK FIRES   │   │  SUCCESS PAGE LOADS            │
│  (Parallel)      │   │                                │
└──────────────────┘   └────────────────────────────────┘
        │                      │
        ▼                      ▼
┌──────────────────────────┐  ┌────────────────────────────┐
│ Webhook Processing       │  │ Fetch Transaction Details  │
│ POST /api/webhooks/      │  │ GET /api/payment/secure-processor?  │
│      payment/route       │  │     token={token}          │
│                          │  └────────────────────────────┘
│ 1. Verify signature      │              │
│ 2. Parse transaction     │              ▼
│ 3. Extract userId from   │  ┌────────────────────────────┐
│    tracking_id           │  │ Display Transaction Info   │
│ 4. Find user in DB       │  │ • Order ID                 │
│ 5. Extract token count   │  │ • Amount & Currency        │
│    from description      │  │ • Status                   │
│ 6. Update user balance:  │  │ • Customer Email           │
│    availableGenerations  │  └────────────────────────────┘
│    += tokens             │              │
│ 7. Create transaction    │              ▼
│    record                │  ┌────────────────────────────┐
│ 8. Generate PDF receipt  │  │ START POLLING MECHANISM    │
│ 9. Send email            │  │                            │
└──────────────────────────┘  │ Initial Check:             │
                              │ GET /api/payment/          │
                              │     verify-balance?        │
                              │     transactionId={id}     │
                              └────────────────────────────┘
                                          │
                                          ▼
                              ┌────────────────────────────┐
                              │ Balance Verification API   │
                              │                            │
                              │ 1. Authenticate user       │
                              │ 2. Get user from DB        │
                              │ 3. Check for transaction   │
                              │    with matching:          │
                              │    • userId                │
                              │    • tracking_id           │
                              │    • status: successful    │
                              │ 4. Return:                 │
                              │    { balanceUpdated,       │
                              │      currentBalance,       │
                              │      transaction }         │
                              └────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐              ┌──────────────────────────┐
        │ Balance NOT Updated   │              │ Balance Updated ✓        │
        │ (Webhook not done yet)│              │ (Transaction found)      │
        └───────────────────────┘              └──────────────────────────┘
                    │                                           │
                    ▼                                           ▼
        ┌───────────────────────┐              ┌──────────────────────────┐
        │ Poll Again in 2 Sec   │              │ SHOW SUCCESS STATE       │
        │ (Max 15 attempts)     │              │                          │
        │                       │              │ ✓ Green checkmark        │
        │ Show Loading:         │              │ ✓ Success message        │
        │ "Обновление баланса   │              │ ✓ Show countdown         │
        │  токенов..."          │              │   "Redirecting in 5s"    │
        └───────────────────────┘              └──────────────────────────┘
                    │                                           │
                    │                                           ▼
                    │                          ┌──────────────────────────┐
                    │                          │ COUNTDOWN TIMER          │
                    │                          │                          │
                    │                          │ 5... 4... 3... 2... 1... │
                    │                          │                          │
                    │                          │ Update button text:      │
                    │                          │ "Перейти к панели (3s)"  │
                    │                          └──────────────────────────┘
                    │                                           │
                    │                                           ▼
                    │                          ┌──────────────────────────┐
                    │                          │ AUTO-REDIRECT            │
                    │                          │                          │
                    │                          │ router.push('/dashboard')│
                    └──────────────────────────┴──────────────────────────┘
                                               │
                                               ▼
                                ┌──────────────────────────┐
                                │     DASHBOARD PAGE       │
                                │                          │
                                │ • User lands on dashboard│
                                │ • Updated balance visible│
                                │ • Ready to use tokens    │
                                │ • Can start generating   │
                                └──────────────────────────┘

                                ┌──────────────────────────┐
                                │    TIMEOUT SCENARIO      │
                                │  (After 30 seconds)      │
                                │                          │
                                │ Show message:            │
                                │ "Баланс будет обновлен   │
                                │  в ближайшее время"     │
                                │                          │
                                │ Manual button available: │
                                │ "Вернуться в панель"     │
                                │                          │
                                │ (Balance will still be   │
                                │  updated by webhook)     │
                                └──────────────────────────┘
```

## State Diagram - Success Page

```
┌─────────────┐
│   LOADING   │  Initial state - Fetching transaction data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ TRANSACTION │  Transaction details loaded successfully
│   LOADED    │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐   ┌──────────┐
│  VERIFYING  │   │  ERROR   │  Failed to load transaction
│   BALANCE   │   └──────────┘
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐   ┌──────────┐
│  VERIFIED   │   │ TIMEOUT  │  Max polling attempts reached
│   (Success) │   └────┬─────┘
└──────┬──────┘        │
       │               │
       ▼               ▼
┌─────────────┐   ┌──────────────────┐
│ COUNTDOWN   │   │ MANUAL REDIRECT  │
└──────┬──────┘   │    AVAILABLE     │
       │          └──────────────────┘
       ▼
┌─────────────┐
│  REDIRECT   │  router.push('/dashboard')
└─────────────┘
```

## API Communication Flow

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│ Success Page │ ──(1)──>│ Verify Balance   │ ──(2)──>│  Database   │
│   (Client)   │         │      API         │         │             │
└──────────────┘         └──────────────────┘         └─────────────┘
       │                         │                           │
       │                         │<────(3)─────────────────── │
       │                         │   User + Transaction Data   
       │                         │                            
       │<─────(4)────────────────│                            
       │   { balanceUpdated,                                 
       │     currentBalance,                                  
       │     transaction }                                    
       │                                                      
       ▼                                                      
┌──────────────┐                                             
│ Update UI    │                                             
│ Start Timer  │                                             
│ Redirect     │                                             
└──────────────┘                                             

(1) GET /api/payment/verify-balance?transactionId=xxx
(2) Query user and transaction
(3) Return data
(4) JSON response
```

## Timing Diagram

```
Time (seconds)
0    2    4    6    8    10   12   14   16   18   20   22   24   26   28   30
│    │    │    │    │    │    │    │    │    │    │    │    │    │    │    │
│────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│                                                                              
│ Landing on Success Page                                                     
├─> Fetch Transaction Details (immediate)                                     
│                                                                              
├──> Poll 1 (immediate)                                                        
│    ├─ Not found                                                             
│                                                                              
├────> Poll 2 (2s)                                                             
│      ├─ Not found                                                           
│                                                                              
├──────> Poll 3 (4s)                                                           
│        ├─ Not found                                                         
│                                                                              
├────────> Poll 4 (6s) ✓ FOUND!                                               
│          ├─ Balance verified                                                
│          ├─ Show success state                                              
│          ├─ Start countdown                                                 
│          │                                                                   
├──────────> Countdown: 5                                                      
│                                                                              
├────────────> Countdown: 4                                                    
│                                                                              
├──────────────> Countdown: 3                                                  
│                                                                              
├────────────────> Countdown: 2                                                
│                                                                              
├──────────────────> Countdown: 1                                              
│                                                                              
├────────────────────> REDIRECT to /dashboard                                  
│                                                                              
│ Total time: ~11 seconds (6s verification + 5s countdown)                    
│                                                                              
│ IF TIMEOUT (30s):                                                           
├─────────────────────────────────────────────────────────────────────────> 
                                                              Show manual button
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pro Modal                                │
│                                                                   │
│  User selects tokens → Shows NetworkPaymentWidget                │
│  Passes: { amount, currency, orderId, userId, customerEmail }    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NetworkPaymentWidget                            │
│                                                                   │
│  Creates payment token → Opens hosted page → Returns here        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Payment Success Page (After Payment)                │
│                                                                   │
│  useEffect #1: Fetch transaction details                         │
│  useEffect #2: Poll balance verification                         │
│  useEffect #3: Countdown and redirect                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard Page                                │
│                                                                   │
│  Shows updated balance → User can start using tokens             │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Paths

```
                    ┌─────────────────┐
                    │ Payment Success │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌──────────────┐ ┌────────────┐
    │ Network Error │ │ Auth Failed  │ │ DB Error   │
    └───────┬───────┘ └──────┬───────┘ └─────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Show Error State│
                    │ Manual redirect │
                    │ available       │
                    └─────────────────┘
```

## Data Flow - Webhook to Client

```
Secure-processor Gateway                                         Client
      │                                                   │
      ▼                                                   │
┌──────────┐                                             │
│ Webhook  │                                             │
│ Triggers │                                             │
└────┬─────┘                                             │
     │                                                    │
     ▼                                                    │
┌──────────────────┐                                     │
│ Update Balance   │                                     │
│ in Database      │                                     │
│                  │                                     │
│ availableTokens  │                                     │
│ = old + new      │                                     │
└────┬─────────────┘                                     │
     │                                                    │
     ▼                                                    │
┌──────────────────┐                                     │
│ Create           │                                     │
│ Transaction      │                                     │
│ Record           │                                     │
└────┬─────────────┘                                     │
     │                                                    │
     │                                                    ▼
     │                                      ┌──────────────────────┐
     │                                      │ Client Polls API     │
     │                                      │ Every 2 seconds      │
     │                                      └───────┬──────────────┘
     │                                              │
     │                                              ▼
     │                                      ┌──────────────────────┐
     │◄─────────────────────────────────────┤ Query Database       │
                                            │ Find Transaction     │
                                            └───────┬──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────────────┐
                                            │ Return to Client:    │
                                            │ { balanceUpdated,    │
                                            │   currentBalance,    │
                                            │   transaction }      │
                                            └──────────────────────┘
```

---

## Legend

- `→` Flow direction
- `▼` Sequential step
- `┌─┐` Component/State
- `├─┤` Decision point
- `✓` Success condition
- `│` Parallel execution

---

**Note:** Diagrams are simplified for clarity. Actual implementation includes additional error handling, validation, and edge case management.

