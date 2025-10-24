/**
 * Simple User Insert Test
 * Quick verification that user inserts work correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUserInsert() {
  console.log('🧪 Testing User Insert...\n');

  const testClerkId = `test_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;

  try {
    // Test 1: Insert User
    console.log('1️⃣ Inserting test user...');
    const user = await prisma.user.create({
      data: {
        clerkId: testClerkId,
        email: testEmail,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'User',
        availableGenerations: 20,
      },
    });
    console.log('✅ User created:', {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      availableGenerations: user.availableGenerations,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    // Test 2: Verify User
    console.log('\n2️⃣ Verifying user...');
    const foundUser = await prisma.user.findUnique({
      where: { clerkId: testClerkId },
    });
    if (foundUser) {
      console.log('✅ User verified in database');
    } else {
      throw new Error('User not found after insert');
    }

    // Test 3: Update User
    console.log('\n3️⃣ Updating user...');
    const updatedUser = await prisma.user.update({
      where: { clerkId: testClerkId },
      data: {
        firstName: 'Updated',
        availableGenerations: 30,
      },
    });
    console.log('✅ User updated:', {
      firstName: updatedUser.firstName,
      availableGenerations: updatedUser.availableGenerations,
      updatedAt: updatedUser.updatedAt,
    });

    // Test 4: Cleanup
    console.log('\n4️⃣ Cleaning up...');
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ Test user deleted');

    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testUserInsert();


