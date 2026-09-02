/**
 * Create tables step by step in Neon database
 * Run: node create-tables.mjs
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_bGkWOy2u4EAd@ep-dry-surf-b3hgg1so-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🚀 Creating tables in Neon database...\n');

const sql = neon(DATABASE_URL);

async function createTable(name, sqlQuery) {
  try {
    console.log(`⏳ Creating ${name}...`);
    await sql.unsafe(sqlQuery);
    console.log(`✅ ${name} created!\n`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  ${name} already exists (skipping)\n`);
      return true;
    } else {
      console.error(`❌ Error creating ${name}:`, error.message);
      return false;
    }
  }
}

try {
  // 1. Create licenses table
  await createTable('licenses table', `
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
  `);

  // 2. Create indexes
  await createTable('licenses indexes', `
    CREATE INDEX idx_licenses_license_key ON licenses(license_key);
    CREATE INDEX idx_licenses_device_id ON licenses(device_id);
    CREATE INDEX idx_licenses_status ON licenses(status);
    CREATE INDEX idx_licenses_created_at ON licenses(created_at DESC)
  `);

  // 3. Create update trigger function
  await createTable('update trigger function', `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  // 4. Create trigger
  await createTable('update trigger', `
    DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
    CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `);

  // 5. Create activation_logs table
  await createTable('activation_logs table', `
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
  `);

  // 6. Create activation_logs indexes
  await createTable('activation_logs indexes', `
    CREATE INDEX idx_activation_logs_license_key ON activation_logs(license_key);
    CREATE INDEX idx_activation_logs_created_at ON activation_logs(created_at DESC)
  `);

  // 7. Insert sample data
  console.log('⏳ Inserting sample data...');
  await sql`
    INSERT INTO licenses (license_key, status) VALUES
      ('KASIR-TEST-1234-5678', 'PENDING'),
      ('KASIR-DEMO-ABCD-EFGH', 'PENDING')
    ON CONFLICT (license_key) DO NOTHING
  `;
  console.log('✅ Sample data inserted!\n');

  // 8. Verify
  console.log('🔍 Verifying...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  
  console.log('\n📋 Tables created:');
  tables.forEach(t => {
    console.log('   ✅', t.table_name);
  });

  const count = await sql`SELECT COUNT(*) as count FROM licenses`;
  console.log(`\n📊 licenses table has ${count[0].count} rows`);

  console.log('\n🎉 Database setup complete!');
  console.log('✅ Ready to use! Open http://localhost:3000\n');

} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
