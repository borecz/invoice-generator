#!/usr/bin/env tsx

/**
 * Development Workflow Validation Script
 * 
 * This script validates that the development workflow is properly configured
 * and all required components are in place.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: ValidationResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string): void {
  results.push({ name, status, message });
}

function checkFileExists(filePath: string, description: string): boolean {
  const exists = fs.existsSync(path.resolve(filePath));
  addResult(
    description,
    exists ? 'pass' : 'fail',
    exists ? `✅ ${filePath} exists` : `❌ ${filePath} missing`
  );
  return exists;
}

function checkCommand(command: string, description: string): boolean {
  try {
    execSync(command, { stdio: 'pipe' });
    addResult(description, 'pass', `✅ ${command} works`);
    return true;
  } catch (error) {
    addResult(description, 'fail', `❌ ${command} failed`);
    return false;
  }
}

function checkPackageScript(script: string, description: string): boolean {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const exists = packageJson.scripts && packageJson.scripts[script];
  addResult(
    description,
    exists ? 'pass' : 'fail',
    exists ? `✅ npm run ${script} available` : `❌ npm run ${script} missing`
  );
  return exists;
}

function validateEnvironmentFiles(): void {
  console.log('🔍 Validating Environment Configuration...\n');
  
  checkFileExists('.env.local.template', 'Local environment template');
  checkFileExists('.env.remote.template', 'Remote environment template');
  checkFileExists('.env.test', 'Test environment file');
  checkFileExists('.env.local', 'Current local environment file');
}

function validateScripts(): void {
  console.log('🔍 Validating NPM Scripts...\n');
  
  // Development scripts
  checkPackageScript('dev', 'Default development script');
  checkPackageScript('dev:local', 'Local development script');
  checkPackageScript('dev:remote', 'Remote development script');
  
  // Environment scripts
  checkPackageScript('env:switch', 'Environment switching script');
  checkPackageScript('env:status', 'Environment status script');
  
  // Database scripts
  checkPackageScript('db:start', 'Database start script');
  checkPackageScript('db:stop', 'Database stop script');
  checkPackageScript('db:status', 'Database status script');
  checkPackageScript('db:reset', 'Database reset script');
  checkPackageScript('db:migrate', 'Database migration script');
  checkPackageScript('db:seed', 'Database seed script');
  checkPackageScript('db:types', 'Database types generation script');
  
  // Testing scripts
  checkPackageScript('test', 'Unit tests script');
  checkPackageScript('test:e2e', 'E2E tests script');
  checkPackageScript('test:all', 'All tests script');
  checkPackageScript('test:local', 'Local testing script');
  checkPackageScript('test:remote', 'Remote testing script');
}

function validateWorkflowScripts(): void {
  console.log('🔍 Validating Workflow Scripts...\n');
  
  checkFileExists('scripts/switch-env.ts', 'Environment switching script');
  checkFileExists('scripts/db-manager.ts', 'Database management script');
  checkFileExists('scripts/validate-workflow.ts', 'Workflow validation script');
}

function validateDocumentation(): void {
  console.log('🔍 Validating Documentation...\n');
  
  checkFileExists('docs/DEVELOPMENT-WORKFLOW.md', 'Development workflow documentation');
  checkFileExists('docs/TESTING.md', 'Testing documentation');
  checkFileExists('README.md', 'Project README');
}

function validateSupabaseSetup(): void {
  console.log('🔍 Validating Supabase Setup...\n');
  
  checkFileExists('supabase/config.toml', 'Supabase configuration');
  checkFileExists('supabase/migrations', 'Supabase migrations directory');
  checkFileExists('supabase/seed.sql', 'Supabase seed file');
  
  // Check if Supabase CLI is installed
  checkCommand('supabase --version', 'Supabase CLI installation');
}

function validateTestingSetup(): void {
  console.log('🔍 Validating Testing Setup...\n');
  
  checkFileExists('vitest.config.ts', 'Vitest configuration');
  checkFileExists('playwright.config.ts', 'Playwright configuration');
  checkFileExists('tests', 'Tests directory');
  
  // Check if test dependencies are installed
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const hasVitest = packageJson.devDependencies?.vitest;
  const hasPlaywright = packageJson.devDependencies?.['@playwright/test'];
  
  addResult(
    'Vitest dependency',
    hasVitest ? 'pass' : 'fail',
    hasVitest ? '✅ Vitest installed' : '❌ Vitest missing'
  );
  
  addResult(
    'Playwright dependency',
    hasPlaywright ? 'pass' : 'fail',
    hasPlaywright ? '✅ Playwright installed' : '❌ Playwright missing'
  );
}

function validateGitIgnore(): void {
  console.log('🔍 Validating Git Configuration...\n');
  
  if (checkFileExists('.gitignore', 'Git ignore file')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    const hasEnvLocal = gitignore.includes('.env.local');
    const hasPlaywrightAuth = gitignore.includes('playwright/.auth/');
    
    addResult(
      'Environment files in .gitignore',
      hasEnvLocal ? 'pass' : 'warning',
      hasEnvLocal ? '✅ .env.local ignored' : '⚠️  .env.local should be in .gitignore'
    );
    
    addResult(
      'Playwright auth in .gitignore',
      hasPlaywrightAuth ? 'pass' : 'warning',
      hasPlaywrightAuth ? '✅ playwright/.auth/ ignored' : '⚠️  playwright/.auth/ should be in .gitignore'
    );
  }
}

function printResults(): void {
  console.log('\n📊 Validation Results:\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });
  
  console.log(`\n📈 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   📊 Total: ${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 Development workflow is properly configured!');
    console.log('💡 Run "npm run dev:local" to start development');
  } else {
    console.log('\n🔧 Some issues need to be addressed before the workflow is complete.');
    console.log('📚 See docs/DEVELOPMENT-WORKFLOW.md for setup instructions');
  }
}

// Main execution
console.log('🔧 Development Workflow Validation\n');
console.log('This script validates that all components of the development workflow are properly configured.\n');

validateEnvironmentFiles();
validateScripts();
validateWorkflowScripts();
validateDocumentation();
validateSupabaseSetup();
validateTestingSetup();
validateGitIgnore();

printResults();
