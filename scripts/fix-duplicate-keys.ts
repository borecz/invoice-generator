#!/usr/bin/env node

/**
 * Fix Duplicate Keys Script
 *
 * This script fixes duplicate keys in JSON translation files by:
 * 1. Parsing the JSON while tracking key locations
 * 2. Identifying duplicate keys and their contexts
 * 3. Merging duplicate objects intelligently
 * 4. Removing simple duplicate key-value pairs
 * 5. Creating a clean, deduplicated JSON file
 */

import fs from "fs";
import path from "path";

// TypeScript interfaces
interface DuplicateKeyInfo {
  key: string;
  firstLine: number;
  duplicateLine: number;
  firstValue: string | null;
  duplicateValue: string | null;
}

const MESSAGES_DIR = path.join(process.cwd(), "messages");

class DuplicateKeyFixer {
  private duplicates: DuplicateKeyInfo[];
  private merged: Record<string, any>;

  constructor() {
    this.duplicates = [];
    this.merged = {};
  }

  // Parse JSON content and identify duplicates
  private parseWithDuplicateDetection(
    content: string,
    filePath: string
  ): DuplicateKeyInfo[] {
    const lines = content.split("\n");
    const keyPattern = /^\s*"([^"]+)"\s*:\s*(.*)/;
    const seenKeys = new Map<string, number>();
    const duplicates: DuplicateKeyInfo[] = [];

    lines.forEach((line, index) => {
      const match = line.match(keyPattern);
      if (match) {
        const key = match[1];
        const lineNumber = index + 1;

        if (seenKeys.has(key)) {
          duplicates.push({
            key,
            firstLine: seenKeys.get(key)!,
            duplicateLine: lineNumber,
            firstValue: this.extractValue(lines, seenKeys.get(key)! - 1),
            duplicateValue: this.extractValue(lines, index),
          });
        } else {
          seenKeys.set(key, lineNumber);
        }
      }
    });

    return duplicates;
  }

  // Extract value from a line (simple string or object start)
  extractValue(lines, lineIndex) {
    const line = lines[lineIndex];
    const match = line.match(/^\s*"([^"]+)"\s*:\s*(.*)/);
    if (match) {
      const value = match[2].trim();
      if (value === "{") {
        // It's an object, extract the full object
        return this.extractObject(lines, lineIndex);
      } else {
        // It's a simple value
        return value;
      }
    }
    return null;
  }

  // Extract a complete object from lines starting at lineIndex
  extractObject(lines, startIndex) {
    let braceCount = 0;
    let objectLines = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      objectLines.push(line);

      // Count braces to find object end
      for (const char of line) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
      }

      if (braceCount === 0 && i > startIndex) {
        break;
      }
    }

    return objectLines.join("\n");
  }

  // Intelligently merge duplicate objects
  mergeObjects(obj1Str, obj2Str) {
    try {
      // Try to parse both as JSON objects
      const cleanObj1 = this.cleanObjectString(obj1Str);
      const cleanObj2 = this.cleanObjectString(obj2Str);

      const obj1 = JSON.parse(cleanObj1);
      const obj2 = JSON.parse(cleanObj2);

      // Merge objects, with obj2 taking precedence
      return { ...obj1, ...obj2 };
    } catch (error) {
      console.warn(
        "Could not merge objects, keeping second one:",
        error.message
      );
      return obj2Str;
    }
  }

  // Clean object string for JSON parsing
  cleanObjectString(objStr) {
    // Remove leading key and colon, keep only the object part
    const lines = objStr.split("\n");
    const firstLine = lines[0];
    const match = firstLine.match(/^\s*"[^"]+"\s*:\s*(.*)/);

    if (match && match[1].trim() === "{") {
      // Replace first line with just the opening brace
      lines[0] = "{";
    }

    return lines.join("\n");
  }

  // Fix duplicates in a JSON file by removing duplicate lines
  fixDuplicatesInFile(filePath) {
    console.log(`\n🔧 Fixing duplicates in ${path.basename(filePath)}...`);

    const content = fs.readFileSync(filePath, "utf8");
    const duplicates = this.parseWithDuplicateDetection(content, filePath);

    if (duplicates.length === 0) {
      console.log("✅ No duplicates found");
      return;
    }

    console.log(`Found ${duplicates.length} duplicate keys`);

    try {
      // Create backup first
      const backupPath = filePath + ".backup";
      fs.writeFileSync(backupPath, content);

      // Remove duplicate lines by keeping only the last occurrence
      const lines = content.split("\n");
      const seenKeys = new Map<string, number>();
      const linesToRemove = new Set<number>();
      const keyPattern = /^\s*"([^"]+)"\s*:/;

      // First pass: identify all key positions
      lines.forEach((line, index) => {
        const match = line.match(keyPattern);
        if (match) {
          const key = match[1];
          if (seenKeys.has(key)) {
            // Mark the previous occurrence for removal
            linesToRemove.add(seenKeys.get(key)!);
          }
          seenKeys.set(key, index);
        }
      });

      // Second pass: remove duplicate lines
      const cleanedLines = lines.filter(
        (line, index) => !linesToRemove.has(index)
      );

      // Write the cleaned content
      const cleanedContent = cleanedLines.join("\n");

      // Validate that the result is valid JSON
      JSON.parse(cleanedContent);

      fs.writeFileSync(filePath, cleanedContent);

      console.log(`✅ Fixed ${duplicates.length} duplicate keys`);

      // Show what was fixed
      const uniqueKeys = [...new Set(duplicates.map((d) => d.key))];
      console.log(
        `   Deduplicated keys: ${uniqueKeys.slice(0, 10).join(", ")}${
          uniqueKeys.length > 10 ? "..." : ""
        }`
      );

      // Remove backup if successful
      fs.unlinkSync(backupPath);
    } catch (error: any) {
      console.error(`❌ Failed to fix duplicates: ${error.message}`);

      // Restore from backup if it exists
      const backupPath = filePath + ".backup";
      if (fs.existsSync(backupPath)) {
        fs.writeFileSync(filePath, fs.readFileSync(backupPath, "utf8"));
        console.log(`   Restored from backup: ${backupPath}`);
      }
    }
  }

  // Manual fix for complex cases
  manualFix(filePath, content, duplicates) {
    console.log("   Attempting manual fix...");

    const lines = content.split("\n");
    const linesToRemove = new Set();

    // Mark duplicate lines for removal (keep the last occurrence)
    duplicates.forEach((dup) => {
      linesToRemove.add(dup.firstLine - 1); // Convert to 0-based index
    });

    // Remove marked lines
    const cleanedLines = lines.filter(
      (line, index) => !linesToRemove.has(index)
    );

    try {
      // Validate the result
      const testContent = cleanedLines.join("\n");
      JSON.parse(testContent);

      // Write the fixed content
      fs.writeFileSync(filePath, testContent);
      console.log("✅ Manual fix successful");
    } catch (error) {
      console.error(`❌ Manual fix failed: ${error.message}`);
      console.log("   Please fix this file manually");
    }
  }

  // Fix all translation files
  fixAllFiles() {
    console.log("🔧 Starting duplicate key fix for all translation files...");

    if (!fs.existsSync(MESSAGES_DIR)) {
      console.error(`❌ Messages directory not found: ${MESSAGES_DIR}`);
      return;
    }

    const files = fs
      .readdirSync(MESSAGES_DIR)
      .filter((file) => file.endsWith(".json"))
      .sort();

    console.log(`Found ${files.length} translation files`);

    for (const file of files) {
      const filePath = path.join(MESSAGES_DIR, file);
      this.fixDuplicatesInFile(filePath);
    }

    console.log("\n✨ Duplicate key fixing complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Run validation: npm run validate:translations");
    console.log("2. Review changes and test the application");
    console.log("3. Commit the fixed translation files");
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new DuplicateKeyFixer();

  const args = process.argv.slice(2);
  if (args.length > 0 && args[0].endsWith(".json")) {
    // Fix specific file
    const filePath = path.resolve(args[0]);
    fixer.fixDuplicatesInFile(filePath);
  } else {
    // Fix all files
    fixer.fixAllFiles();
  }
}

module.exports = DuplicateKeyFixer;
