#!/usr/bin/env node

/**
 * Simple Duplicate Key Fixer
 * 
 * This script fixes duplicate keys in JSON translation files by:
 * 1. Parsing the JSON (which automatically keeps the last occurrence of duplicates)
 * 2. Re-serializing with proper formatting
 * 3. Validating the result
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

class SimpleDuplicateFixer {
  
  // Count duplicate keys in a file
  private countDuplicates(content: string): number {
    const lines = content.split('\n');
    const keyPattern = /^\s*"([^"]+)"\s*:/;
    const seenKeys = new Set<string>();
    let duplicateCount = 0;

    for (const line of lines) {
      const match = line.match(keyPattern);
      if (match) {
        const key = match[1];
        if (seenKeys.has(key)) {
          duplicateCount++;
        } else {
          seenKeys.add(key);
        }
      }
    }

    return duplicateCount;
  }

  // Fix duplicates in a single file
  fixFile(filePath: string): void {
    console.log(`\n🔧 Fixing duplicates in ${path.basename(filePath)}...`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const duplicateCount = this.countDuplicates(content);

      if (duplicateCount === 0) {
        console.log('✅ No duplicates found');
        return;
      }

      console.log(`Found ${duplicateCount} duplicate keys`);

      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);

      // Parse JSON (this automatically handles duplicates by keeping the last occurrence)
      const parsed = JSON.parse(content);

      // Re-serialize with proper formatting
      const cleanContent = JSON.stringify(parsed, null, 2) + '\n';

      // Write the cleaned content
      fs.writeFileSync(filePath, cleanContent);

      // Verify the fix worked
      const newDuplicateCount = this.countDuplicates(cleanContent);
      
      if (newDuplicateCount === 0) {
        console.log(`✅ Fixed ${duplicateCount} duplicate keys`);
        // Remove backup if successful
        fs.unlinkSync(backupPath);
      } else {
        console.log(`⚠️  Still has ${newDuplicateCount} duplicates after fix`);
      }

    } catch (error: any) {
      console.error(`❌ Failed to fix duplicates: ${error.message}`);
      
      // Restore from backup if it exists
      const backupPath = filePath + '.backup';
      if (fs.existsSync(backupPath)) {
        fs.writeFileSync(filePath, fs.readFileSync(backupPath, 'utf8'));
        console.log(`   Restored from backup`);
      }
    }
  }

  // Fix all translation files
  fixAllFiles(): void {
    console.log('🔧 Starting simple duplicate key fix for all translation files...');

    if (!fs.existsSync(MESSAGES_DIR)) {
      console.error(`❌ Messages directory not found: ${MESSAGES_DIR}`);
      return;
    }

    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    console.log(`Found ${files.length} translation files`);

    for (const file of files) {
      const filePath = path.join(MESSAGES_DIR, file);
      this.fixFile(filePath);
    }

    console.log('\n✨ Simple duplicate key fixing complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run validation: npm run validate:translations');
    console.log('2. Review changes and test the application');
    console.log('3. Commit the fixed translation files');
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new SimpleDuplicateFixer();
  
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0].endsWith('.json')) {
    // Fix specific file
    const filePath = path.resolve(args[0]);
    fixer.fixFile(filePath);
  } else {
    // Fix all files
    fixer.fixAllFiles();
  }
}

export default SimpleDuplicateFixer;
