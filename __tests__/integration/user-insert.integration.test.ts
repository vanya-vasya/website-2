/**
 * User Insert Integration Test
 * 
 * Tests the full write path from API to database
 * Validates that User records can be inserted into Neon PostgreSQL
 */

import prismadb from '@/lib/prismadb';
import { createUser } from '@/lib/actions/user.actions';

describe('User Insert Integration Tests', () => {
  const testClerkId = `test_clerk_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;

  afterAll(async () => {
    // Cleanup test data
    try {
      await prismadb.user.deleteMany({
        where: {
          email: {
            startsWith: 'test_',
          },
        },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await prismadb.$disconnect();
  });

  describe('Direct Prisma Operations', () => {
    it('should connect to the database', async () => {
      await expect(prismadb.$connect()).resolves.not.toThrow();
    });

    it('should insert a user using prisma.user.create', async () => {
      const userData = {
        clerkId: `${testClerkId}_direct`,
        email: `direct_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Direct',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      const user = await prismadb.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.clerkId).toBe(userData.clerkId);
      expect(user.email).toBe(userData.email);
      expect(user.availableGenerations).toBe(20);
      expect(user.usedGenerations).toBe(0);
    });

    it('should retrieve the inserted user', async () => {
      const user = await prismadb.user.findUnique({
        where: { clerkId: `${testClerkId}_direct` },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(`direct_${testEmail}`);
    });

    it('should enforce unique constraint on clerkId', async () => {
      const userData = {
        clerkId: `${testClerkId}_direct`,
        email: 'another_email@example.com',
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Duplicate',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      await expect(
        prismadb.user.create({ data: userData })
      ).rejects.toThrow();
    });

    it('should enforce unique constraint on email', async () => {
      const userData = {
        clerkId: 'another_clerk_id',
        email: `direct_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Duplicate',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      await expect(
        prismadb.user.create({ data: userData })
      ).rejects.toThrow();
    });
  });

  describe('Server Actions', () => {
    it('should insert a user using createUser action', async () => {
      const userData = {
        clerkId: `${testClerkId}_action`,
        email: `action_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Action',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      const user = await createUser(userData);

      expect(user).toBeDefined();
      expect(user?.id).toBeDefined();
      expect(user?.clerkId).toBe(userData.clerkId);
      expect(user?.email).toBe(userData.email);
    });

    it('should handle errors in createUser action', async () => {
      // Try to insert duplicate
      const userData = {
        clerkId: `${testClerkId}_action`,
        email: `action_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Action',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      const result = await createUser(userData);
      
      // createUser catches errors and returns undefined
      expect(result).toBeUndefined();
    });
  });

  describe('Transaction Operations', () => {
    it('should insert user within a transaction', async () => {
      const userData = {
        clerkId: `${testClerkId}_txn`,
        email: `txn_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Transaction',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      const result = await prismadb.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: userData,
        });
        return user;
      });

      expect(result).toBeDefined();
      expect(result.clerkId).toBe(userData.clerkId);
    });

    it('should rollback transaction on error', async () => {
      const userData1 = {
        clerkId: `${testClerkId}_rollback1`,
        email: `rollback1_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Rollback1',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      const userData2 = {
        clerkId: `${testClerkId}_rollback1`, // Same clerkId to trigger error
        email: `rollback2_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'Test',
        lastName: 'Rollback2',
        availableGenerations: 20,
        usedGenerations: 0,
      };

      await expect(
        prismadb.$transaction(async (tx) => {
          await tx.user.create({ data: userData1 });
          await tx.user.create({ data: userData2 }); // This should fail
        })
      ).rejects.toThrow();

      // Verify first user was rolled back
      const user = await prismadb.user.findUnique({
        where: { clerkId: userData1.clerkId },
      });
      expect(user).toBeNull();
    });
  });

  describe('Field Validations', () => {
    it('should insert user with minimal required fields', async () => {
      const userData = {
        clerkId: `${testClerkId}_minimal`,
        email: `minimal_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
      };

      const user = await prismadb.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
      expect(user.availableGenerations).toBe(20); // Default value
      expect(user.usedGenerations).toBe(0); // Default value
    });

    it('should insert user with all optional fields', async () => {
      const userData = {
        clerkId: `${testClerkId}_complete`,
        email: `complete_${testEmail}`,
        photo: 'https://example.com/photo.jpg',
        firstName: 'John',
        lastName: 'Doe',
        availableGenerations: 50,
        usedGenerations: 10,
      };

      const user = await prismadb.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.availableGenerations).toBe(50);
      expect(user.usedGenerations).toBe(10);
    });

    it('should fail when required fields are missing', async () => {
      const incompleteData = {
        clerkId: `${testClerkId}_incomplete`,
        // missing email and photo
      };

      await expect(
        prismadb.user.create({ data: incompleteData as any })
      ).rejects.toThrow();
    });
  });

  describe('Connection and Configuration', () => {
    it('should have DATABASE_URL configured', () => {
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.DATABASE_URL).toContain('postgresql://');
    });

    it('should connect to Neon PostgreSQL', async () => {
      const result: any = await prismadb.$queryRaw`SELECT version()`;
      expect(result).toBeDefined();
      expect(result[0].version).toContain('PostgreSQL');
    });

    it('should verify User table exists', async () => {
      const result: any = await prismadb.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'User'
        );
      `;
      expect(result[0].exists).toBe(true);
    });

    it('should verify User table has correct columns', async () => {
      const columns: any = await prismadb.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'User'
        ORDER BY ordinal_position;
      `;

      const columnNames = columns.map((c: any) => c.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('clerkId');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('photo');
      expect(columnNames).toContain('firstName');
      expect(columnNames).toContain('lastName');
      expect(columnNames).toContain('usedGenerations');
      expect(columnNames).toContain('availableGenerations');
      expect(columnNames).toContain('createdAt');
      expect(columnNames).toContain('updatedAt');
    });
  });
});


