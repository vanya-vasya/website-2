# ✅ Clerk Webhook - Чеклист исправления

**КРИТИЧЕСКАЯ ПРОБЛЕМА:** Пользователи не создаются в БД при регистрации

---

## 🔍 ШАГ 1: Проверить настройки Clerk Dashboard

### 1.1 Зайти в Clerk Dashboard
https://dashboard.clerk.com

### 1.2 Проверить Webhooks
1. В левом меню выбрать **Webhooks**
2. Найти webhook для вашего приложения

### 1.3 Проверить конфигурацию:

**Должно быть:**
```
Endpoint URL: https://www.nerbixa.com/api/webhooks/clerk
   (или https://nerbixa.com/api/webhooks/clerk)
   
Message Filtering:
☑️ user.created  ← ОБЯЗАТЕЛЬНО!
☐ user.updated (опционально)
☐ user.deleted (опционально)

Status: ✓ Active
```

**Если webhook НЕ НАЙДЕН:**
1. Нажать **Add Endpoint**
2. Ввести URL: `https://www.nerbixa.com/api/webhooks/clerk`
3. Отметить событие: `user.created`
4. Нажать **Create**
5. **Скопировать Signing Secret** (начинается с `whsec_`)

### 1.4 Проверить попытки доставки
1. Кликнуть на webhook
2. Перейти во вкладку **"Attempts"**
3. Посмотреть статус последних запросов:
   - 🟢 **200 OK** = работает
   - 🔴 **500 Internal Server Error** = проблема с WEBHOOK_SECRET
   - 🔴 **401 Unauthorized** = неверный signing secret
   - ⚪ **Нет попыток** = webhook не настроен или не срабатывает

### 1.5 Если видите ошибки:
Кликнуть на ошибочную попытку и посмотреть:
- Request payload (что отправил Clerk)
- Response (что вернул ваш сервер)
- Error message (текст ошибки)

---

## 🔧 ШАГ 2: Настроить Vercel Environment Variables

### 2.1 Зайти в Vercel
https://vercel.com/dashboard

### 2.2 Выбрать проект
Найти проект с domain `nerbixa.com` или `www.nerbixa.com`

### 2.3 Перейти в Settings → Environment Variables

### 2.4 Проверить WEBHOOK_SECRET

**Должна быть переменная:**
```
Name: WEBHOOK_SECRET
Value: whsec_... (из Clerk Dashboard, шаг 1.3)
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Если НЕТ - добавить:**
1. Нажать **Add New**
2. Ввести:
   - **Name:** `WEBHOOK_SECRET`
   - **Value:** скопировать из Clerk Dashboard (Signing Secret)
   - Отметить **все окружения**
3. Нажать **Save**

### 2.5 Проверить DATABASE_URL

**Должна быть переменная:**
```
Name: DATABASE_URL
Value: postgresql://<user>:<password>@<host>/<database>?sslmode=require
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

Если есть - отлично. Если нет - добавить из `.env.local`

### 2.6 Перезапустить Deployment
1. Перейти во вкладку **Deployments**
2. Найти последний deployment
3. Нажать **⋮** (три точки)
4. Выбрать **Redeploy**
5. Дождаться завершения (примерно 1 минута)

---

## 🧪 ШАГ 3: Протестировать webhook

### 3.1 Отправить тестовый webhook из Clerk

1. В Clerk Dashboard → Webhooks → ваш webhook
2. Перейти во вкладку **"Testing"**
3. Выбрать событие: `user.created`
4. Нажать **Send Example**
5. Посмотреть ответ

**Ожидаемый успешный ответ:**
```json
{
  "message": "OK",
  "user": {
    "id": "...",
    "clerkId": "...",
    "email": "...",
    "availableGenerations": 20
  },
  "transaction": {
    "id": "...",
    "amount": 20,
    "type": "credit",
    "reason": "signup bonus"
  }
}
```

### 3.2 Проверить базу данных

```bash
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
pool.query('SELECT COUNT(*) as count FROM \"User\"')
  .then(r => {
    console.log('Пользователей в БД:', r.rows[0].count);
    if (r.rows[0].count > 0) {
      return pool.query('SELECT email, \"availableGenerations\", \"createdAt\" FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 3');
    }
  })
  .then(r => {
    if (r) console.table(r.rows);
  })
  .finally(() => pool.end());
" dotenv_config_path=.env.local
```

**Ожидается:** Число пользователей > 0

### 3.3 Проверить логи Vercel

1. Vercel Dashboard → Deployments → Latest
2. Перейти во вкладку **Functions**
3. Найти функцию `/api/webhooks/clerk`
4. Посмотреть логи

**Должны быть сообщения:**
```
[Clerk Webhook] Starting transaction for user creation
[Clerk Webhook] User created
[Clerk Webhook] Transaction record created
[Clerk Webhook] Transaction completed successfully
```

---

## 🧹 ШАГ 4: Очистить существующих пользователей (опционально)

Если в Clerk есть пользователи, которые были созданы до настройки webhook:

### Вариант A: Попросить перерегистрироваться
1. Удалить пользователя в Clerk Dashboard
2. Пользователь регистрируется заново
3. Теперь webhook сработает

### Вариант B: Создать вручную в БД

Для пользователя `vladimir.serushko@gmail.com` с Clerk ID `user_34WzeL7bWWVIQqzDuqgSoDDlnL8`:

```bash
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return \`\${timestamp}\${randomPart}\`;
};

pool.query('BEGIN')
  .then(() => {
    const userId = generateId();
    return pool.query(
      'INSERT INTO \"User\" (\"id\", \"clerkId\", \"email\", \"firstName\", \"lastName\", \"photo\", \"availableGenerations\", \"usedGenerations\") VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8) RETURNING *',
      [userId, 'user_34WzeL7bWWVIQqzDuqgSoDDlnL8', 'vladimir.serushko@gmail.com', 'Vladimir', 'Serushko', 'https://img.clerk.com/default.png', 20, 0]
    );
  })
  .then(r => {
    console.log('✅ User created:', r.rows[0]);
    const txnId = generateId();
    return pool.query(
      'INSERT INTO \"Transaction\" (\"id\", \"tracking_id\", \"userId\", \"amount\", \"type\", \"reason\", \"status\", \"paid_at\") VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, NOW()) RETURNING *',
      [txnId, 'user_34WzeL7bWWVIQqzDuqgSoDDlnL8', r.rows[0].id, 20, 'credit', 'signup bonus', 'completed']
    );
  })
  .then(r => {
    console.log('✅ Transaction created:', r.rows[0]);
    return pool.query('COMMIT');
  })
  .then(() => {
    console.log('✅ Done! User and transaction created.');
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    return pool.query('ROLLBACK');
  })
  .finally(() => pool.end());
" dotenv_config_path=.env.local
```

---

## ✅ КРИТЕРИИ УСПЕХА:

После исправления:

**В Clerk Dashboard:**
- ✓ Webhook настроен с правильным URL
- ✓ Событие `user.created` отмечено
- ✓ Тестовый webhook возвращает 200 OK
- ✓ В "Attempts" видны успешные доставки (зеленые)

**В Vercel:**
- ✓ WEBHOOK_SECRET настроен
- ✓ После redeploy нет ошибок
- ✓ Логи показывают успешное создание пользователей

**В базе данных:**
- ✓ Таблица User содержит записи
- ✓ Новые пользователи появляются автоматически
- ✓ У каждого пользователя availableGenerations = 20
- ✓ В таблице Transaction есть записи с reason = 'signup bonus'

**В приложении:**
- ✓ Новые пользователи могут войти в dashboard
- ✓ Видят свои 20 бесплатных кредитов
- ✓ Могут покупать дополнительные токены
- ✓ После оплаты токены начисляются правильно

---

## 🚨 ЧАСТЫЕ ОШИБКИ:

### Ошибка 1: "Error verifying webhook"
**Причина:** Неверный WEBHOOK_SECRET  
**Решение:** Скопировать заново из Clerk Dashboard

### Ошибка 2: "Cannot read properties of undefined"
**Причина:** WEBHOOK_SECRET не задан  
**Решение:** Добавить в Vercel Environment Variables

### Ошибка 3: Webhook доставляется, но 404
**Причина:** Неверный URL webhook  
**Решение:** Проверить, что URL точно `https://www.nerbixa.com/api/webhooks/clerk`

### Ошибка 4: Webhook доставляется, но ничего не происходит
**Причина:** База данных не подключена  
**Решение:** Проверить DATABASE_URL в Vercel

---

## 📞 ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ:

1. Проверить логи Vercel Functions для `/api/webhooks/clerk`
2. Отправить скриншот из Clerk Dashboard → Webhooks → Attempts
3. Запустить команду проверки БД и показать результат
4. Проверить, что все environment variables в Vercel заданы правильно

---

**НАЧАТЬ С ШАГА 1!** Проверить Clerk Dashboard - webhook вообще настроен?

