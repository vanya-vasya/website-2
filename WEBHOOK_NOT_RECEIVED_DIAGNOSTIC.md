# 🔍 ДИАГНОСТИКА: Webhook от Secure-processor не получен

**Проблема:** После успешного создания payment checkout, баланс не обновился и транзакция не записана в БД.

**Время:** 2025-10-25T11:02:35Z

---

## ✅ **ЧТО РАБОТАЕТ**

### Payment Checkout Creation:
```
✅ Payment API called
✅ Secure-processor checkout created successfully
✅ notification_url: https://www.nerbixa.com/api/webhooks/secure-processor ← ПРАВИЛЬНЫЙ!
✅ return_url: https://www.nerbixa.com/payment/success ← ПРАВИЛЬНЫЙ!
✅ User ID: user_34WzeL7bWWVIQqzDuqgSoDDlnL8
✅ Order ID: gen_user_34WzeL7bWWVIQqzDuqgSoDDlnL8_1761390152578
```

---

## ❌ **ЧТО НЕ РАБОТАЕТ**

### Webhook не получен:
```
❌ Нет логов "📥 Secure-processor Webhook Received" в Vercel
❌ Транзакция не создана в БД
❌ Баланс пользователя не обновлен
```

---

## 🔍 **ВОЗМОЖНЫЕ ПРИЧИНЫ**

### 1. **Платеж не завершен** ⚠️
**Вопрос:** Вы **ПОЛНОСТЬЮ завершили** оплату на странице Secure-processor?

**Что нужно сделать:**
- [ ] Открыли страницу оплаты Secure-processor
- [ ] Ввели тестовую карту: `4012 0000 0000 1006`
- [ ] Expiry: `12/31`, CVV: `123`
- [ ] **Нажали кнопку "Pay"**
- [ ] Увидели "Payment Successful"
- [ ] Были перенаправлены обратно на nerbixa.com

**Если не завершили платеж:**
→ Secure-processor НЕ отправит webhook!  
→ Webhook отправляется ТОЛЬКО после успешной оплаты

---

### 2. **Secure-processor отправляет webhook с задержкой** ⏱️

**Типичное время доставки:**
- Мгновенно (0-2 секунды) - 90% случаев
- С задержкой (10-60 секунд) - 10% случаев
- Retry при ошибке (до 5 минут) - редко

**Что делать:**
1. Подождите 1-2 минуты
2. Обновите Vercel Logs
3. Ищите строку: `📥 Secure-processor Webhook Received`

---

### 3. **Secure-processor не может достучаться до webhook URL** 🚫

**Возможные проблемы:**

#### A) DNS не разрешается
```bash
# Проверьте, что домен доступен
nslookup www.nerbixa.com
ping www.nerbixa.com
```

#### B) SSL/TLS проблемы
```
Secure-processor требует HTTPS с валидным сертификатом
```

#### C) Vercel блокирует запросы
```
Проверьте: Vercel Dashboard → Firewall Settings
```

#### D) Rate limiting
```
Проверьте: Vercel Dashboard → Usage → Function Invocations
```

---

### 4. **Secure-processor отправляет на неправильный URL** 🔗

**Проверка в Secure-processor Dashboard:**

1. Зайдите в: https://backoffice.secure-processorpay.com/
2. Найдите транзакцию (последние 10 минут)
3. Кликните на транзакцию → View Details
4. Проверьте поле **"Notification URL"**

**Должно быть:**
```
https://www.nerbixa.com/api/webhooks/secure-processor
```

**Если другой URL:**
→ Проблема в настройках Secure-processor магазина  
→ Нужно обновить в Secure-processor Dashboard

---

### 5. **Webhook приходит, но падает с ошибкой** ⚠️

**Как проверить:**

1. Откройте Vercel Logs
2. Фильтр: Last 10 minutes
3. Ищите ANY упоминания:
   - `secure-processor`
   - `webhook`
   - `/api/webhooks/secure-processor`
   - Ошибки 400, 403, 500

**Типичные ошибки:**

```
❌ Missing signature in webhook
   → Secure-processor не отправляет X-Signature header
   → Решение: Мы уже обходим это для test transactions

❌ User not found
   → User еще не создан в БД
   → Решение: Сначала зарегистрируйте пользователя

❌ Connection timeout
   → DB connection issue
   → Решение: Уже исправлено (timeout увеличен до 30s)
```

---

## 🧪 **ТЕСТИРОВАНИЕ WEBHOOK ВРУЧНУЮ**

### Запустите тест webhook:

```bash
./test-secure-processor-webhook-manual.sh
```

Этот скрипт:
1. Отправит тестовый webhook на production endpoint
2. Проверит, что endpoint отвечает 200 OK
3. Покажет, что искать в Vercel logs

**Ожидаемый результат:**
```json
{ "status": "ok" }
HTTP Status: 200
```

**Затем проверьте Vercel Logs:**
```
📥 Secure-processor Webhook Received - RAW BODY
Transaction ID (uid): test-1134bdda-...
Status: successful
✅ User found: vladimir.serushko@gmail.com
🎟️  Tokens to add: 50
✅ Transaction record created
✅ User balance updated
   Previous balance: 20
   New available generations: 70
```

---

## 📊 **WEBHOOK FLOW DIAGRAM**

```
User completes payment on Secure-processor
           ↓
Secure-processor processes payment
           ↓
Secure-processor sends webhook POST request
           ↓ (HTTPS)
https://www.nerbixa.com/api/webhooks/secure-processor
           ↓
Vercel receives request
           ↓
Next.js API route handler
           ↓
app/api/webhooks/secure-processor/route.ts
           ↓
Parse body.transaction
           ↓
Verify user exists
           ↓
Extract token amount (50)
           ↓
Database transaction:
  - Create Transaction record
  - Update User balance (+50)
           ↓
Return { status: 'ok' } 200
           ↓
Secure-processor marks webhook as delivered
```

**Где может сломаться:**
- ❌ Secure-processor → Vercel (network/DNS issue)
- ❌ Vercel → Next.js (deployment issue)
- ❌ Parse body (code error) ← Уже исправлено!
- ❌ Verify user (user not in DB)
- ❌ DB transaction (timeout/error) ← Уже исправлено!

---

## 🔧 **НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ**

### Шаг 1: Проверьте Vercel Logs (СЕЙЧАС!)

```
Vercel Dashboard → Deployments → Latest → Runtime Logs
Filter: Last 15 minutes
Search: "secure-processor"
```

**Что искать:**
- ✅ `📥 Secure-processor Webhook Received` - webhook пришел
- ❌ Ничего не найдено - webhook не пришел

### Шаг 2: Если webhook НЕ найден - проверьте Secure-processor

```
Secure-processor Dashboard → Transactions
Find: Transaction around 11:02 UTC
Check: "Notification URL" field
Check: "Webhook Status" (Delivered/Failed/Pending)
```

### Шаг 3: Если webhook найден, но есть ошибка

**Скопируйте полные логи ошибки и отправьте мне:**
```
[timestamp] [error] ...full error message...
```

### Шаг 4: Попробуйте еще раз

**С чистого листа:**
1. Убедитесь, что пользователь `user_34WzeL7bWWVIQqzDuqgSoDDlnL8` есть в БД
2. Откройте новую вкладку Vercel Logs
3. Инициируйте новый платеж
4. ПОЛНОСТЬЮ завершите оплату
5. Наблюдайте логи в реальном времени

---

## 📝 **CHECKLIST**

Перед следующей попыткой убедитесь:

- [ ] Пользователь `vladimir.serushko@gmail.com` есть в БД
- [ ] Пользователь имеет текущий баланс (например, 20 credits)
- [ ] Vercel logs открыты и обновляются
- [ ] Вы ПОЛНОСТЬЮ завершаете платеж на Secure-processor (не просто открываете страницу)
- [ ] Ждете 30 секунд после завершения платежа
- [ ] Проверяете логи на наличие webhook

---

## 🎯 **ОЖИДАЕМЫЕ ЛОГИ (Успешный случай)**

### 1. Payment Initiation:
```
2025-10-25T11:02:35.083Z [info] === Secure-processor Payment API Called ===
2025-10-25T11:02:35.090Z [info] notification_url: https://www.nerbixa.com/api/webhooks/secure-processor
2025-10-25T11:02:35.777Z [info] ✅ Payment checkout created successfully
```

### 2. Webhook Receipt (ЧЕРЕЗ 10-60 СЕКУНД):
```
2025-10-25T11:03:15.535Z [info] ═══════════════════════════════════════════════════════
2025-10-25T11:03:15.535Z [info] 📥 Secure-processor Webhook Received - RAW BODY:
2025-10-25T11:03:15.535Z [info] { "transaction": { "uid": "...", "status": "successful", ... } }
2025-10-25T11:03:15.537Z [info] Transaction ID (uid): 1134bdda-...
2025-10-25T11:03:15.537Z [info] Status: successful
2025-10-25T11:03:15.538Z [info] Tracking ID (User ID): user_34WzeL7bWWVIQqzDuqgSoDDlnL8
2025-10-25T11:03:15.540Z [info] ✅ User found: vladimir.serushko@gmail.com
2025-10-25T11:03:15.540Z [info] Current balance: 20
2025-10-25T11:03:15.542Z [info] 🎟️  Tokens to add: 50
2025-10-25T11:03:15.545Z [info] ✅ Transaction record created in Transaction table
2025-10-25T11:03:15.547Z [info] ✅ User balance updated in User table
2025-10-25T11:03:15.547Z [info]    Previous balance: 20
2025-10-25T11:03:15.547Z [info]    New available generations: 70
```

**Если вы НЕ видите блок #2 - webhook не пришел!**

---

## 🚨 **КРИТИЧНО: Завершили ли вы оплату?**

Часто проблема в том, что:
- ✅ Checkout создан
- ✅ Страница Secure-processor открыта
- ❌ **НО ПЛАТЕЖ НЕ ЗАВЕРШЕН!**

**Secure-processor отправляет webhook ТОЛЬКО после:**
1. User ввел данные карты
2. User нажал "Pay" / "Submit"
3. Secure-processor обработал платеж
4. Статус стал "Successful"

**Если вы только открыли страницу оплаты и закрыли:**
→ Webhook НЕ будет отправлен!

---

## 📞 **СЛЕДУЮЩИЙ ШАГ**

**Пожалуйста, ответьте:**

1. **Вы ЗАВЕРШИЛИ оплату на странице Secure-processor?**
   - [ ] Да, ввел карту и нажал Pay, увидел Success
   - [ ] Нет, только открыл страницу
   - [ ] Не уверен

2. **Что вы видите в Vercel Logs при поиске "secure-processor"?**
   - [ ] Только "Payment API Called" (нет webhook)
   - [ ] Вижу "Webhook Received" + ошибку
   - [ ] Вижу "Webhook Received" + успех
   - [ ] Ничего не вижу

3. **Какой текущий баланс у пользователя `vladimir.serushko@gmail.com`?**
   - Ответ: _____ credits

После ответа на эти вопросы я смогу точно определить проблему!

---

## 📚 **ПОЛЕЗНЫЕ ССЫЛКИ**

- **Secure-processor Dashboard:** https://backoffice.secure-processorpay.com/
- **Vercel Logs:** Vercel Dashboard → Your Project → Deployments → Latest → Runtime Logs
- **Test Webhook Script:** `./test-secure-processor-webhook-manual.sh`

---

**Главный вопрос: ВЫ ЗАВЕРШИЛИ ПЛАТЕЖ? Это критично!** 🔥

