/**
 * Database Setup Script
 * 
 * Drops and recreates all tables with clean schema
 * Run this to reset the database
 */

import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

// Load environment variables
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

async function setupDatabase() {
  console.log('='.repeat(80));
  console.log('DATABASE SETUP - NEON POSTGRESQL');
  console.log('='.repeat(80));

  const client = await pool.connect();

  try {
    console.log('\n✓ Connected to database');

    // Read schema SQL file
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('\n📋 Executing schema...');
    
    // Execute schema (this will drop and recreate tables)
    await client.query(schemaSql);

    console.log('✓ Schema executed successfully');

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n✓ Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verify indexes
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY indexname;
    `);

    console.log('\n✓ Indexes created:');
    indexesResult.rows.forEach(row => {
      console.log(`  - ${row.indexname}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ DATABASE SETUP COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

