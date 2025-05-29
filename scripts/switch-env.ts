#!/usr/bin/env tsx

/**
 * Environment Switching Script
 * 
 * This script helps switch between local and remote database configurations
 * for development and testing purposes.
 */

import fs from 'fs';
import path from 'path';

type Environment = 'local' | 'remote';

interface EnvironmentConfig {
  name: string;
  description: string;
  templateFile: string;
  targetFile: string;
}

const environments: Record<Environment, EnvironmentConfig> = {
  local: {
    name: 'Local Development',
    description: 'Uses local Supabase instance (http://127.0.0.1:54321)',
    templateFile: '.env.local.template',
    targetFile: '.env.local'
  },
  remote: {
    name: 'Remote Development',
    description: 'Uses remote Supabase instance (production database)',
    templateFile: '.env.remote.template',
    targetFile: '.env.local'
  }
};

function switchEnvironment(env: Environment): void {
  const config = environments[env];
  const templatePath = path.resolve(config.templateFile);
  const targetPath = path.resolve(config.targetFile);

  // Check if template file exists
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template file not found: ${config.templateFile}`);
    process.exit(1);
  }

  try {
    // Create backup of current .env.local if it exists
    if (fs.existsSync(targetPath)) {
      const backupPath = `${targetPath}.backup.${Date.now()}`;
      fs.copyFileSync(targetPath, backupPath);
      console.log(`📦 Backed up current environment to: ${path.basename(backupPath)}`);
    }

    // Copy template to target
    fs.copyFileSync(templatePath, targetPath);
    
    console.log(`✅ Switched to ${config.name}`);
    console.log(`📝 ${config.description}`);
    
    if (env === 'remote') {
      console.log(`⚠️  WARNING: You are now using the REMOTE database!`);
      console.log(`   Be careful not to pollute production data during testing.`);
    } else {
      console.log(`🏠 You are now using the LOCAL database (safe for development).`);
    }
    
    console.log(`\n🔄 Please restart your development server for changes to take effect.`);
    
  } catch (error) {
    console.error(`❌ Failed to switch environment:`, error);
    process.exit(1);
  }
}

function showCurrentEnvironment(): void {
  const envPath = path.resolve('.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❓ No .env.local file found');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  
  if (content.includes('127.0.0.1:54321')) {
    console.log('🏠 Current environment: LOCAL (safe for development)');
    console.log('   Database: http://127.0.0.1:54321');
  } else if (content.includes('blzucskpmidiikxtxmay.supabase.co')) {
    console.log('🌐 Current environment: REMOTE (production database)');
    console.log('   Database: https://blzucskpmidiikxtxmay.supabase.co');
    console.log('   ⚠️  WARNING: Using production database!');
  } else {
    console.log('❓ Current environment: UNKNOWN');
  }
}

function showHelp(): void {
  console.log(`
🔧 Environment Switching Tool

Usage:
  npm run env:switch local   - Switch to local Supabase (default for development)
  npm run env:switch remote  - Switch to remote Supabase (use with caution)
  npm run env:status         - Show current environment

Environments:
  local  - ${environments.local.description}
  remote - ${environments.remote.description}

Safety Notes:
  • Always use LOCAL environment for development and testing
  • Only use REMOTE environment when specifically needed
  • Tests always use LOCAL environment regardless of this setting
  • Backup files are created automatically when switching
`);
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'local':
  case 'remote':
    switchEnvironment(command as Environment);
    break;
  case 'status':
    showCurrentEnvironment();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error('❌ Invalid command. Use "local", "remote", "status", or "help"');
    showHelp();
    process.exit(1);
}
