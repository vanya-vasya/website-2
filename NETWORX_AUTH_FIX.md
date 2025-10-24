# Networx Payment "Access Denied" - Решение

## Проблема

```
Networx API Error Response: {"response":{"status":"error","message":"Access denied"}}
```

## Возможные причины

### 1. Неверные учетные данные (Наиболее вероятно)
**Проблема:** Shop ID или Secret Key неверные или не активированы в Networx.

**Решение:**
- Проверьте учетные данные в панели Networx
- Убедитесь, что аккаунт активирован
- Проверьте, что используете правильный Shop ID для production/test mode

### 2. Переменные окружения в Vercel
**Проблема:** Vercel может использовать дефолтные значения вместо реальных.

**Проверьте в Vercel:**
```
NETWORX_SHOP_ID=your_real_shop_id
NETWORX_SECRET_KEY=your_real_secret_key
NETWORX_RETURN_URL=https://your-domain.vercel.app/payment/success
NETWORX_WEBHOOK_URL=https://your-domain.vercel.app/api/webhooks/networx
```

### 3. API Endpoint
**Текущий:** `https://checkout.networxpay.com/ctp/api/checkouts`
**Возможная проблема:** Возможно нужен другой endpoint для вашего аккаунта.

### 4. IP Whitelist
**Проблема:** Networx может требовать добавления IP-адресов Vercel в whitelist.

## Быстрое решение: Режим тестирования

Пока разбираемся с учетными данными, можно использовать test mode для локального тестирования:

### Опция A: Временно включить локальный test mode

Измените в `app/api/payment/networx/route.ts`:

```typescript
const testMode = true; // Временно для тестирования
```

Это будет возвращать mock данные без реального обращения к API.

### Опция B: Использовать Networx Test Mode

Убедитесь, что у вас есть test credentials от Networx:
- Test Shop ID
- Test Secret Key

И используйте их в environment variables с префиксом TEST_.

## Рекомендуемые шаги

### Шаг 1: Проверить Networx Dashboard
1. Войдите в https://dashboard.networxpay.com
2. Проверьте Shop Settings → API Credentials
3. Убедитесь, что аккаунт активирован
4. Проверьте, что API доступ включен

### Шаг 2: Проверить Environment Variables в Vercel
1. Зайдите в Vercel Dashboard
2. Settings → Environment Variables
3. Убедитесь, что переменные установлены для Production
4. Перезапустите deployment после изменения

### Шаг 3: Проверить формат аутентификации
Networx использует HTTP Basic Auth. Проверьте, что формат правильный:

```typescript
'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`
```

### Шаг 4: Связаться с Networx Support
Если проблема не решается:
- Email: support@networxpay.com
- Сообщите: "Access denied при создании checkout через API"
- Предоставьте: Shop ID, API endpoint, timestamp запроса

## Временное решение для продолжения разработки

Создам альтернативную версию с fallback на test mode при ошибке авторизации.

