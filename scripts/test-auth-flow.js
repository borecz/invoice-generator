#!/usr/bin/env node

/**
 * Test script to verify authentication flow and identify issues
 */

console.log('🔍 AUTHENTICATION FLOW DIAGNOSIS');
console.log('=====================================\n');

console.log('📋 CHECKING AUTHENTICATION SETUP...\n');

// Check if environment variables are properly set
console.log('1. Environment Variables:');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let envIssues = [];
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: Set (${process.env[envVar].substring(0, 20)}...)`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
    envIssues.push(envVar);
  }
});

if (envIssues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUE: Missing environment variables!');
  console.log('   These variables must be set in your .env.local file:');
  envIssues.forEach(envVar => {
    console.log(`   - ${envVar}`);
  });
  console.log('\n   Please check your .env.local file and restart the development server.');
  process.exit(1);
}

console.log('\n2. File Structure Check:');

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'app/[locale]/auth/actions.ts',
  'app/component/auth/LoginForm.tsx',
  'app/hooks/useAuth.ts',
  'lib/supabase/client.ts',
  'middleware.ts'
];

let fileIssues = [];
criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${filePath}: Exists`);
  } else {
    console.log(`   ❌ ${filePath}: Missing`);
    fileIssues.push(filePath);
  }
});

if (fileIssues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUE: Missing authentication files!');
  fileIssues.forEach(file => {
    console.log(`   - ${file}`);
  });
  process.exit(1);
}

console.log('\n3. Import Path Analysis:');

// Check for common import issues
const checkImports = (filePath, expectedImports) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    expectedImports.forEach(importPath => {
      if (content.includes(importPath)) {
        console.log(`   ✅ ${path.basename(filePath)}: Imports ${importPath}`);
      } else {
        console.log(`   ❌ ${path.basename(filePath)}: Missing import ${importPath}`);
      }
    });
  } catch (error) {
    console.log(`   ❌ ${path.basename(filePath)}: Error reading file`);
  }
};

checkImports('app/component/auth/LoginForm.tsx', [
  '@/app/[locale]/auth/actions'
]);

checkImports('app/component/auth/SignUpForm.tsx', [
  '@/app/[locale]/auth/actions'
]);

console.log('\n4. Authentication Flow Issues:');

console.log('   Common causes of "doom wheel" (infinite loading):');
console.log('   - Environment variables not set correctly');
console.log('   - Supabase project not configured');
console.log('   - Network connectivity issues');
console.log('   - Conflicting authentication states');
console.log('   - Middleware redirect loops');

console.log('\n📝 DEBUGGING STEPS:');
console.log('=====================================');

console.log('\n1. Check Browser Console:');
console.log('   - Open browser dev tools (F12)');
console.log('   - Look for JavaScript errors');
console.log('   - Check Network tab for failed requests');

console.log('\n2. Check Server Logs:');
console.log('   - Look for Supabase connection errors');
console.log('   - Check for middleware redirect loops');
console.log('   - Verify auth action responses');

console.log('\n3. Test Authentication Manually:');
console.log('   - Try creating a test user in Supabase dashboard');
console.log('   - Verify Supabase project settings');
console.log('   - Check RLS (Row Level Security) policies');

console.log('\n4. Verify Environment:');
console.log('   - Restart development server after env changes');
console.log('   - Clear browser cache and cookies');
console.log('   - Try incognito/private browsing mode');

console.log('\n✅ AUTHENTICATION SETUP VERIFICATION COMPLETE');
console.log('\nIf issues persist, check the browser console and server logs for specific error messages.');
