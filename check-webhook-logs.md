# 🔍 Диагностика: Webhook от Networx не получен

## Что проверить в Vercel Logs:

### 1. Поиск webhook событий
Ищите в логах строки:
- `📥 Networx Webhook Received - RAW BODY:`
- `Transaction ID (uid):`
- `Status: successful`

### 2. Если webhook НЕ найден - возможные причины:

#### A) Networx отправляет webhook на другой URL
**Проверка:**
- Зайдите в Networx Dashboard
- Transactions → Найдите транзакцию
- Проверьте "Notification URL"

#### B) Networx ждет ответа 200 OK
**Текущий код:**
```typescript
return NextResponse.json({ status: 'ok' }, { status: 200 });
```
Должно работать ✅

#### C) Networx отправляет webhook с задержкой
**Решение:**
- Подождите 1-2 минуты
- Обновите логи в Vercel

#### D) Webhook заблокирован Vercel
**Проверка:**
- Vercel Dashboard → Settings → Domains
- Убедитесь, что www.nerbixa.com настроен

### 3. Timing Test - Прошел ли платеж?
Вы завершили оплату на странице Networx?
- [ ] Да, ввел карту и нажал "Pay"
- [ ] Нет, только открыл страницу оплаты

## 🔧 Следующие шаги:

1. Проверьте Vercel Logs за последние 5 минут
2. Ищите строку "Networx Webhook Received"
3. Если не найдено - проверьте Networx Dashboard
