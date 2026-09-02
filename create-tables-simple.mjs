/**
 * Create tables ONE BY ONE in Neon database
 * Run: node create-tables-simple.mjs
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_bGkWOy2u4EAd@ep-dry-surf-b3hgg1so-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🚀 Creating tables in Neon database...\n');

const sql = neon(DATABASE_URL);

try {
  // Step 1: Drop existing tables if any (clean slate)
  console.log('🗑️  Dropping existing tables (if any)...');
  try {
    await sql`DROP TABLE IF EXISTS activation_logs CASCADE`;
    await sql`DROP TABLE IF EXISTS licenses CASCADE`;
    await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`;
    console.log('✅ Cleaned up!\n');
  } catch (e) {
    console.log('⚠️  Nothing to clean\n');
  }

  // Step 2: Create licenses table
  console.log('📋 Creating licenses table...');
  await sql`
    CREATE TABLE licenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_key TEXT NOT NULL UNIQUE,
      device_id TEXT,
      device_name TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')),
      activated_at TIMESTAMP WITH TIME ZONE,
      reset_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ licenses table created!\n');

  // Step 3: Create indexes
  console.log('📋 Creating indexes...');
  await sql`CREATE INDEX idx_licenses_license_key ON licenses(license_key)`;
  await sql`CREATE INDEX idx_licenses_device_id ON licenses(device_id)`;
  await sql`CREATE INDEX idx_licenses_status ON licenses(status)`;
  await sql`CREATE INDEX idx_licenses_created_at ON licenses(created_at DESC)`;
  console.log('✅ Indexes created!\n');

  // Step 4: Create trigger function
  console.log('📋 Creating trigger function...');
  await sql`
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `;
  console.log('✅ Trigger function created!\n');

  // Step 5: Create trigger
  console.log('📋 Creating trigger...');
  await sql`
    CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `;
  console.log('✅ Trigger created!\n');

  // Step 6: Create activation_logs table
  console.log('📋 Creating activation_logs table...');
  await sql`
    CREATE TABLE activation_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_key TEXT NOT NULL,
      device_id TEXT NOT NULL,
      device_name TEXT,
      action TEXT NOT NULL CHECK (action IN ('ACTIVATE', 'RESET', 'REVOKE')),
      ip_address TEXT,
      user_agent TEXT,
      success BOOLEAN NOT NULL DEFAULT TRUE,
      error_message TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ activation_logs table created!\n');

  // Step 7: Create activation_logs indexes
  console.log('📋 Creating activation_logs indexes...');
  await sql`CREATE INDEX idx_activation_logs_license_key ON activation_logs(license_key)`;
  await sql`CREATE INDEX idx_activation_logs_created_at ON activation_logs(created_at DESC)`;
  console.log('✅ activation_logs indexes created!\n');

  // Step 8: Insert sample data
  console.log('📋 Inserting sample data...');
  await sql`
    INSERT INTO licenses (license_key, status) VALUES
      ('KASIR-TEST-1234-5678', 'PENDING'),
      ('KASIR-DEMO-ABCD-EFGH', 'PENDING')
  `;
  console.log('✅ Sample data inserted!\n');

  // Step 9: Verify
  console.log('🔍 Verifying...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  
  console.log('\n📊 Tables in database:');
  tables.forEach(t => {
    console.log('   ✅', t.table_name);
  });

  const count = await sql`SELECT COUNT(*) as count FROM licenses`;
  console.log(`\n📊 licenses table has ${count[0].count} rows`);

  const sample = await sql`SELECT license_key, status FROM licenses ORDER BY created_at`;
  console.log('\n📋 Sample licenses:');
  sample.forEach(l => {
    console.log(`   • ${l.license_key} (${l.status})`);
  });

  console.log('\n🎉 Database setup complete!');
  console.log('✅ Ready to use! Refresh http://localhost:3000\n');

} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
