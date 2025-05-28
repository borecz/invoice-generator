import path from 'path';
import fs from 'fs/promises';

export interface SharedUserInfo {
  email: string;
  password: string;
  createdAt: string;
}

/**
 * Load shared test user information created during global setup
 */
export async function getSharedUserInfo(): Promise<SharedUserInfo> {
  const userInfoFile = path.join(__dirname, '../../playwright/.auth/user-info.json');
  
  try {
    const userInfoContent = await fs.readFile(userInfoFile, 'utf-8');
    return JSON.parse(userInfoContent);
  } catch (error) {
    throw new Error(
      `Failed to load shared user info from ${userInfoFile}. ` +
      'Make sure global setup has run successfully. ' +
      `Error: ${error}`
    );
  }
}

/**
 * Get the path to the shared authentication state file
 */
export function getAuthStatePath(): string {
  return path.join(__dirname, '../../playwright/.auth/user.json');
}

/**
 * Check if shared authentication state exists
 */
export async function hasSharedAuth(): Promise<boolean> {
  try {
    await fs.access(getAuthStatePath());
    return true;
  } catch {
    return false;
  }
}
