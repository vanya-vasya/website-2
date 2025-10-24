# Настройка Environment Variables в Vercel

## Проблема "Access Denied" - Решение

Ошибка возникает из-за отсутствия или неверных учетных данных Networx в Vercel.

---

## Шаг 1: Получить учетные данные Networx

### Вариант A: Реальные учетные данные (Production)

1. Войдите в [Networx Dashboard](https://dashboard.networxpay.com)
2. Перейдите в **Settings → API Credentials**
3. Скопируйте:
   - **Shop ID** (например: `29959`)
   - **Secret Key** (длинная строка)

### Вариант B: Тестовые учетные данные (для разработки)

Если у вас нет реальных учетных данных, запросите тестовые:
- Email: support@networxpay.com
- Тема: "Request Test API Credentials"

---

## Шаг 2: Настроить переменные в Vercel

### 2.1 Откройте Vercel Dashboard

1. Зайдите на https://vercel.com
2. Выберите проект **website-1**
3. Перейдите в **Settings → Environment Variables**

### 2.2 Добавьте обязательные переменные

Добавьте следующие переменные для **Production**:

#### 1. NETWORX_SHOP_ID
```
Value: ваш_shop_id_от_networx
Environment: Production, Preview, Development (отметьте все)
```

#### 2. NETWORX_SECRET_KEY
```
Value: ваш_secret_key_от_networx
Environment: Production, Preview, Development (отметьте все)
```

#### 3. NETWORX_TEST_MODE
```
Value: true  (для тестирования) или false (для продакшена)
Environment: Production, Preview, Development
```

#### 4. NETWORX_RETURN_URL
```
Value: https://your-vercel-domain.vercel.app/payment/success
Environment: Production

Для Preview:
Value: https://website-2-git-feature-payment-redirect-vladis-projects-8c520e18.vercel.app/payment/success

Для Development:
Value: http://localhost:3000/payment/success
```

#### 5. NETWORX_WEBHOOK_URL
```
Value: https://your-vercel-domain.vercel.app/api/webhooks/networx
Environment: Production

Для Preview:
Value: https://website-2-git-feature-payment-redirect-vladis-projects-8c520e18.vercel.app/api/webhooks/networx
```

---

## Шаг 3: Примеры конфигурации

### Конфигурация для Production (реальные платежи)

```env
NETWORX_SHOP_ID=29959
NETWORX_SECRET_KEY=your_real_secret_key_from_networx_dashboard
NETWORX_TEST_MODE=false
NETWORX_RETURN_URL=https://nerbixa.com/payment/success
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/networx
```

### Конфигурация для Testing (тестовые платежи)

```env
NETWORX_SHOP_ID=your_test_shop_id
NETWORX_SECRET_KEY=your_test_secret_key
NETWORX_TEST_MODE=true
NETWORX_RETURN_URL=https://your-preview-url.vercel.app/payment/success
NETWORX_WEBHOOK_URL=https://your-preview-url.vercel.app/api/webhooks/networx
```

---

## Шаг 4: Перезапустить Deployment

После добавления/изменения переменных:

### Вариант A: Через Vercel Dashboard
1. Перейдите на вкладку **Deployments**
2. Найдите последний deployment
3. Нажмите **⋮** (три точки) → **Redeploy**
4. Выберите **Use existing Build Cache** (быстрее)

### Вариант B: Через Git Push
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

## Шаг 5: Проверка

### 5.1 Проверить логи deployment

1. Откройте **Deployments → Latest Deployment**
2. Перейдите на вкладку **Build Logs**
3. Убедитесь, что нет ошибок компиляции

### 5.2 Проверить Runtime Logs

1. Откройте **Deployments → Latest Deployment**
2. Перейдите на вкладку **Function Logs**
3. Попробуйте создать платеж
4. Проверьте логи:

**Успешные логи должны показывать:**
```
✅ Environment variables: { shopId: '29959***', secretKey: '***key' }
✅ Networx API Success Response received
✅ Payment checkout created successfully
```

**При ошибке будут логи:**
```
❌ Networx API Error Response
🔒 ACCESS DENIED - Possible causes
```

---

## Шаг 6: Troubleshooting

### Ошибка 1: "Payment gateway not configured"

**Причина:** Переменные NETWORX_SHOP_ID или NETWORX_SECRET_KEY не установлены

**Решение:**
1. Проверьте, что переменные добавлены в Vercel
2. Убедитесь, что выбран правильный Environment (Production/Preview)
3. Перезапустите deployment

### Ошибка 2: "Access denied"

**Причина:** Неверные учетные данные или аккаунт не активирован

**Решение:**
1. Проверьте Shop ID в Networx Dashboard
2. Проверьте Secret Key (скопируйте заново)
3. Убедитесь, что аккаунт активирован
4. Проверьте, что API доступ включен
5. Свяжитесь с Networx Support

### Ошибка 3: Переменные не применяются

**Причина:** Нужен redeploy после изменения переменных

**Решение:**
```bash
# Метод 1: Через Vercel Dashboard
# Deployments → Redeploy

# Метод 2: Через Git
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

## Дополнительные настройки

### IP Whitelist (если требуется)

Если Networx требует IP whitelist, добавьте IP-адреса Vercel:
1. Найдите IP вашего deployment в логах
2. Добавьте их в Networx Dashboard → Settings → IP Whitelist
3. Vercel использует различные IP, может потребоваться диапазон

### Custom Domain

Если используете custom domain:
```env
NETWORX_RETURN_URL=https://nerbixa.com/payment/success
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/networx
```

Убедитесь, что:
1. Domain настроен в Vercel
2. SSL сертификат активен
3. Webhook URL доступен извне

---

## Проверочный список

- [ ] NETWORX_SHOP_ID добавлен в Vercel
- [ ] NETWORX_SECRET_KEY добавлен в Vercel
- [ ] NETWORX_TEST_MODE установлен (true/false)
- [ ] NETWORX_RETURN_URL настроен правильно
- [ ] NETWORX_WEBHOOK_URL настроен правильно
- [ ] Все переменные имеют правильный Environment
- [ ] Deployment перезапущен после изменений
- [ ] Логи проверены на ошибки
- [ ] Тестовый платеж выполнен успешно

---

## Контакты для поддержки

**Networx Support:**
- Email: support@networxpay.com
- Dashboard: https://dashboard.networxpay.com

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Documentation: https://vercel.com/docs/concepts/projects/environment-variables

---

## Полезные команды

```bash
# Проверить локально (если переменные в .env.local)
npm run dev

# Посмотреть переменные Vercel CLI
vercel env ls

# Добавить переменную через CLI
vercel env add NETWORX_SHOP_ID

# Перезапустить deployment
vercel --prod
```

---

**Дата обновления:** Октябрь 24, 2025  
**Версия:** 1.0  
**Статус:** Готово к использованию

