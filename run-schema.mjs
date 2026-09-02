/**
 * Quick script to run Neon database schema
 * Run: node run-schema.mjs
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_bGkWOy2u4EAd@ep-dry-surf-b3hgg1so-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🚀 Connecting to Neon database...\n');

const sql = neon(DATABASE_URL);

try {
  console.log('📄 Reading schema file...\n');
  const schema = fs.readFileSync('supabase/schema-neon.sql', 'utf-8');
  
  console.log('⏳ Executing schema...\n');
  await sql.unsafe(schema);
  
  console.log('✅ Schema executed successfully!\n');
  console.log('🎉 Database setup complete!\n');
  console.log('Tables created:');
  console.log('  - licenses');
  console.log('  - activation_logs\n');
  
  console.log('Sample data inserted:');
  console.log('  - KASIR-TEST-1234-5678');
  console.log('  - KASIR-DEMO-ABCD-EFGH\n');
  
  console.log('✅ Ready to use! Open http://localhost:3000\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
