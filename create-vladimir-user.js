/**
 * Скрипт для ручного создания пользователя Vladimir в базе данных
 * Использовать если Clerk webhook не работает
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
};

async function createVladimirUser() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔧 Создание пользователя Vladimir в базе данных');
  console.log('═══════════════════════════════════════════════════════\n');

  const userData = {
    clerkId: 'user_34WzeL7bWWVIQqzDuqgSoDDlnL8',
    email: 'vladimir.serushko@gmail.com',
    firstName: 'Vladimir',
    lastName: 'Serushko',
    photo: 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yb05jN2xsWVlBa3BGSHFMMU5uUkZ4TFJHWUIiLCJyaWQiOiJ1c2VyXzM0V3plTDdiV1dWSVFxekR1cWdTb0REbG5MOCIsImluaXRpYWxzIjoiVlMifQ',
    availableGenerations: 20,
    usedGenerations: 0
  };

  try {
    // Проверить, существует ли пользователь
    console.log('1️⃣  Проверка существующего пользователя...');
    const existingUser = await pool.query(
      'SELECT * FROM "User" WHERE "clerkId" = $1',
      [userData.clerkId]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Пользователь уже существует в базе данных!');
      console.table(existingUser.rows[0]);
      console.log('\n✅ Ничего делать не нужно.');
      return;
    }

    console.log('✅ Пользователь не найден, создаем...\n');

    // Начать транзакцию
    await pool.query('BEGIN');
    console.log('2️⃣  Транзакция началась...');

    // Создать пользователя
    const userId = generateId();
    const userResult = await pool.query(
      `INSERT INTO "User" 
        ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations", "usedGenerations") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        userId,
        userData.clerkId,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.photo,
        userData.availableGenerations,
        userData.usedGenerations
      ]
    );

    console.log('✅ Пользователь создан:');
    console.table(userResult.rows[0]);

    // Создать транзакцию signup bonus
    const transactionId = generateId();
    const transactionResult = await pool.query(
      `INSERT INTO "Transaction" 
        ("id", "tracking_id", "userId", "amount", "type", "reason", "status", "paid_at") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        transactionId,
        userData.clerkId,
        userId,
        20,
        'credit',
        'signup bonus (manual)',
        'completed'
      ]
    );

    console.log('\n✅ Транзакция signup bonus создана:');
    console.table(transactionResult.rows[0]);

    // Зафиксировать транзакцию
    await pool.query('COMMIT');
    console.log('\n3️⃣  Транзакция зафиксирована');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ УСПЕШНО! Пользователь Vladimir создан в базе данных');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Детали:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Clerk ID: ${userData.clerkId}`);
    console.log(`   Бесплатных кредитов: ${userData.availableGenerations}`);
    console.log(`   Использовано: ${userData.usedGenerations}`);
    console.log('\n🎯 Теперь пользователь может:');
    console.log('   ✓ Войти в dashboard');
    console.log('   ✓ Увидеть свои 20 бесплатных токенов');
    console.log('   ✓ Покупать дополнительные токены');
    console.log('   ✓ Использовать все функции приложения');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('\n❌ ОШИБКА при создании пользователя:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запустить
createVladimirUser()
  .then(() => {
    console.log('\n👋 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error.message);
    process.exit(1);
  });

