/**
 * Setup Neon Database Schema
 * Run: npx tsx scripts/setup-database.ts
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Read SQL schema file
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await sql.unsafe(statement);
        console.log(`✅ Success!\n`);
      } catch (error: any) {
        // Some statements might fail if already exists, that's ok
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Already exists (skipping)\n`);
        } else {
          console.error(`❌ Error:`, error.message, '\n');
        }
      }
    }

    console.log('🎉 Database setup complete!');
    console.log('\n✅ Tables created:');
    console.log('   - licenses');
    console.log('   - activation_logs');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
