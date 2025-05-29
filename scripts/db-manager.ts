#!/usr/bin/env tsx

/**
 * Database Management Script
 * 
 * This script provides utilities for managing local and remote database operations
 * including migrations, seeding, and synchronization.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface DatabaseConfig {
  name: string;
  description: string;
  url: string;
  isLocal: boolean;
}

const databases = {
  local: {
    name: 'Local Supabase',
    description: 'Local development database (safe)',
    url: 'http://127.0.0.1:54321',
    isLocal: true
  },
  remote: {
    name: 'Remote Supabase',
    description: 'Production database (use with caution)',
    url: 'https://blzucskpmidiikxtxmay.supabase.co',
    isLocal: false
  }
} as const;

function executeCommand(command: string, description: string): void {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    process.exit(1);
  }
}

function checkSupabaseInstalled(): void {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Supabase CLI is not installed. Please install it first:');
    console.error('   npm install -g supabase');
    process.exit(1);
  }
}

function ensureLocalSupabaseRunning(): void {
  try {
    execSync('supabase status', { stdio: 'pipe' });
    console.log('✅ Local Supabase is running');
  } catch (error) {
    console.log('🚀 Starting local Supabase...');
    executeCommand('supabase start', 'Starting local Supabase');
  }
}

function startLocal(): void {
  checkSupabaseInstalled();
  executeCommand('supabase start', 'Starting local Supabase');
  console.log('\n📊 Local Supabase Dashboard: http://127.0.0.1:54323');
  console.log('🗄️  Database URL: http://127.0.0.1:54321');
}

function stopLocal(): void {
  checkSupabaseInstalled();
  executeCommand('supabase stop', 'Stopping local Supabase');
}

function resetLocal(): void {
  checkSupabaseInstalled();
  console.log('⚠️  This will reset the local database and apply all migrations');
  executeCommand('supabase db reset', 'Resetting local database');
  console.log('\n✅ Local database has been reset with all migrations applied');
}

function statusLocal(): void {
  checkSupabaseInstalled();
  try {
    execSync('supabase status', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Local Supabase is not running');
    console.log('💡 Run "npm run db:start" to start it');
  }
}

function applyMigrations(): void {
  checkSupabaseInstalled();
  ensureLocalSupabaseRunning();
  
  const migrationsDir = path.resolve('supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('❓ No migrations directory found');
    return;
  }

  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    console.log('❓ No migration files found');
    return;
  }

  console.log(`📋 Found ${migrations.length} migration(s):`);
  migrations.forEach(migration => console.log(`   • ${migration}`));
  
  executeCommand('supabase db reset', 'Applying all migrations to local database');
}

function generateTypes(): void {
  checkSupabaseInstalled();
  ensureLocalSupabaseRunning();
  
  const typesDir = path.resolve('types');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  executeCommand(
    'supabase gen types typescript --local > types/supabase.ts',
    'Generating TypeScript types from local database'
  );
  
  console.log('✅ TypeScript types generated in types/supabase.ts');
}

function seedDatabase(): void {
  checkSupabaseInstalled();
  ensureLocalSupabaseRunning();
  
  const seedFile = path.resolve('supabase/seed.sql');
  if (!fs.existsSync(seedFile)) {
    console.log('❓ No seed.sql file found');
    return;
  }

  executeCommand('supabase db reset', 'Resetting database and applying seed data');
}

function showHelp(): void {
  console.log(`
🗄️  Database Management Tool

Local Database Commands:
  npm run db:start       - Start local Supabase
  npm run db:stop        - Stop local Supabase  
  npm run db:status      - Show local Supabase status
  npm run db:reset       - Reset local database with all migrations
  npm run db:migrate     - Apply all migrations to local database
  npm run db:seed        - Reset database and apply seed data
  npm run db:types       - Generate TypeScript types from local schema
  npm run db:studio      - Open Supabase Studio (dashboard)

Development Workflow:
  1. Start local Supabase: npm run db:start
  2. Apply migrations: npm run db:migrate
  3. Seed test data: npm run db:seed
  4. Generate types: npm run db:types
  5. Develop with local database
  6. Test thoroughly before deploying to remote

Safety Notes:
  • All commands operate on LOCAL database only
  • Remote database operations require manual Supabase CLI commands
  • Always test migrations locally before deploying to production
  • Use "npm run env:status" to check current environment
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'start':
    startLocal();
    break;
  case 'stop':
    stopLocal();
    break;
  case 'status':
    statusLocal();
    break;
  case 'reset':
    resetLocal();
    break;
  case 'migrate':
    applyMigrations();
    break;
  case 'seed':
    seedDatabase();
    break;
  case 'types':
    generateTypes();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error('❌ Invalid command');
    showHelp();
    process.exit(1);
}
