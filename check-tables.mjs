/**
 * Check what tables exist in Neon database
 * Run: node check-tables.mjs
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_bGkWOy2u4EAd@ep-dry-surf-b3hgg1so-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 Checking Neon database...\n');

const sql = neon(DATABASE_URL);

try {
  // Check connection
  console.log('⏳ Testing connection...');
  const result = await sql`SELECT current_database(), current_schema(), version()`;
  console.log('✅ Connected to:', result[0].current_database);
  console.log('   Schema:', result[0].current_schema);
  console.log('   Version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
  console.log('');

  // List all tables
  console.log('📋 Tables in public schema:');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  
  if (tables.length === 0) {
    console.log('   ❌ No tables found!\n');
    console.log('💡 Tables might not have been created. Let me create them now...\n');
  } else {
    console.log('');
    tables.forEach(t => {
      console.log('   ✅', t.table_name);
    });
    console.log('');
    
    // Check licenses table
    if (tables.some(t => t.table_name === 'licenses')) {
      const count = await sql`SELECT COUNT(*) as count FROM licenses`;
      console.log(`📊 licenses table has ${count[0].count} rows\n`);
    }
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
