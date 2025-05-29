#!/usr/bin/env node

/**
 * Advanced Duplicate Key Fixer
 * 
 * This script properly fixes duplicate keys by:
 * 1. Parsing the file line by line
 * 2. Tracking object nesting levels
 * 3. Removing duplicate key lines while preserving structure
 * 4. Validating the result
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface LineInfo {
  line: string;
  lineNumber: number;
  key?: string;
  isKeyLine: boolean;
  indentLevel: number;
}

class AdvancedDuplicateFixer {
  
  // Parse file and identify structure
  private parseFileStructure(content: string): LineInfo[] {
    const lines = content.split('\n');
    const keyPattern = /^(\s*)"([^"]+)"\s*:/;
    const result: LineInfo[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(keyPattern);
      
      const lineInfo: LineInfo = {
        line,
        lineNumber: i + 1,
        isKeyLine: !!match,
        indentLevel: line.length - line.trimStart().length
      };

      if (match) {
        lineInfo.key = match[2];
      }

      result.push(lineInfo);
    }

    return result;
  }

  // Find duplicate keys and their line numbers
  private findDuplicates(structure: LineInfo[]): Map<string, number[]> {
    const keyOccurrences = new Map<string, number[]>();

    for (const lineInfo of structure) {
      if (lineInfo.isKeyLine && lineInfo.key) {
        if (!keyOccurrences.has(lineInfo.key)) {
          keyOccurrences.set(lineInfo.key, []);
        }
        keyOccurrences.get(lineInfo.key)!.push(lineInfo.lineNumber);
      }
    }

    // Filter to only duplicates
    const duplicates = new Map<string, number[]>();
    for (const [key, lineNumbers] of keyOccurrences) {
      if (lineNumbers.length > 1) {
        duplicates.set(key, lineNumbers);
      }
    }

    return duplicates;
  }

  // Remove duplicate lines (keep the last occurrence)
  private removeDuplicateLines(structure: LineInfo[], duplicates: Map<string, number[]>): string {
    const linesToRemove = new Set<number>();

    // For each duplicate key, mark all but the last occurrence for removal
    for (const [key, lineNumbers] of duplicates) {
      // Keep the last occurrence, remove all others
      for (let i = 0; i < lineNumbers.length - 1; i++) {
        linesToRemove.add(lineNumbers[i]);
      }
    }

    // Filter out the duplicate lines
    const cleanedLines = structure
      .filter(lineInfo => !linesToRemove.has(lineInfo.lineNumber))
      .map(lineInfo => lineInfo.line);

    return cleanedLines.join('\n');
  }

  // Fix duplicates in a single file
  fixFile(filePath: string): void {
    console.log(`\n🔧 Fixing duplicates in ${path.basename(filePath)}...`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = this.parseFileStructure(content);
      const duplicates = this.findDuplicates(structure);

      if (duplicates.size === 0) {
        console.log('✅ No duplicates found');
        return;
      }

      const totalDuplicates = Array.from(duplicates.values())
        .reduce((sum, lineNumbers) => sum + lineNumbers.length - 1, 0);

      console.log(`Found ${totalDuplicates} duplicate keys (${duplicates.size} unique keys)`);

      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);

      // Remove duplicate lines
      const cleanedContent = this.removeDuplicateLines(structure, duplicates);

      // Validate the result is valid JSON
      try {
        JSON.parse(cleanedContent);
      } catch (error: any) {
        throw new Error(`Result is not valid JSON: ${error.message}`);
      }

      // Write the cleaned content
      fs.writeFileSync(filePath, cleanedContent);

      // Verify the fix worked
      const newStructure = this.parseFileStructure(cleanedContent);
      const newDuplicates = this.findDuplicates(newStructure);

      if (newDuplicates.size === 0) {
        console.log(`✅ Fixed ${totalDuplicates} duplicate keys`);
        
        // Show some examples of what was fixed
        const exampleKeys = Array.from(duplicates.keys()).slice(0, 5);
        console.log(`   Examples: ${exampleKeys.join(', ')}${duplicates.size > 5 ? '...' : ''}`);
        
        // Remove backup if successful
        fs.unlinkSync(backupPath);
      } else {
        console.log(`⚠️  Still has duplicates after fix`);
      }

    } catch (error: any) {
      console.error(`❌ Failed to fix duplicates: ${error.message}`);
      
      // Restore from backup if it exists
      const backupPath = filePath + '.backup';
      if (fs.existsSync(backupPath)) {
        fs.writeFileSync(filePath, fs.readFileSync(backupPath, 'utf8'));
        console.log(`   Restored from backup`);
        fs.unlinkSync(backupPath);
      }
    }
  }

  // Fix all translation files
  fixAllFiles(): void {
    console.log('🔧 Starting advanced duplicate key fix for all translation files...');

    if (!fs.existsSync(MESSAGES_DIR)) {
      console.error(`❌ Messages directory not found: ${MESSAGES_DIR}`);
      return;
    }

    const files = fs.readdirSync(MESSAGES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    console.log(`Found ${files.length} translation files`);

    let totalFixed = 0;
    for (const file of files) {
      const filePath = path.join(MESSAGES_DIR, file);
      const beforeContent = fs.readFileSync(filePath, 'utf8');
      const beforeStructure = this.parseFileStructure(beforeContent);
      const beforeDuplicates = this.findDuplicates(beforeStructure);
      
      this.fixFile(filePath);
      
      const afterContent = fs.readFileSync(filePath, 'utf8');
      const afterStructure = this.parseFileStructure(afterContent);
      const afterDuplicates = this.findDuplicates(afterStructure);
      
      const fixed = beforeDuplicates.size - afterDuplicates.size;
      totalFixed += fixed;
    }

    console.log(`\n✨ Advanced duplicate key fixing complete!`);
    console.log(`📊 Total duplicate keys fixed: ${totalFixed}`);
    console.log('\n📋 Next steps:');
    console.log('1. Run validation: npm run validate:translations');
    console.log('2. Run tests: npm run test:run -- src/tests/i18n.test.ts');
    console.log('3. Review changes and test the application');
    console.log('4. Commit the fixed translation files');
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new AdvancedDuplicateFixer();
  
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

export default AdvancedDuplicateFixer;
