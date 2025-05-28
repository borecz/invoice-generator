/**
 * Supabase Email Configuration for Testing
 * 
 * This module provides utilities to configure Supabase to use Inbucket
 * for email testing in the test environment.
 */

import { isEmailTestingEnabled, INBUCKET_CONFIG } from "./email";

/**
 * Email configuration for different environments
 */
export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    secure?: boolean;
  };
  from: {
    name: string;
    email: string;
  };
}

/**
 * Gets the appropriate email configuration based on environment
 */
export function getEmailConfig(): EmailConfig {
  if (isEmailTestingEnabled() && process.env.NODE_ENV === "test") {
    // Use Inbucket for testing
    return {
      smtp: {
        host: INBUCKET_CONFIG.smtpHost,
        port: INBUCKET_CONFIG.smtpPort,
        secure: false, // Inbucket doesn't use TLS
      },
      from: {
        name: process.env.SMTP_SENDER_NAME || "Invoice Generator Test",
        email: process.env.SMTP_SENDER_EMAIL || "noreply@test.localhost",
      },
    };
  }

  // Production/development configuration
  return {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === "true",
    },
    from: {
      name: process.env.SMTP_SENDER_NAME || "Invoice Generator",
      email: process.env.SMTP_SENDER_EMAIL || "noreply@invoicegenerator.com",
    },
  };
}

/**
 * Supabase Auth configuration for email testing
 */
export function getSupabaseAuthConfig() {
  const emailConfig = getEmailConfig();

  return {
    // Email confirmation settings
    ENABLE_EMAIL_CONFIRMATIONS: process.env.ENABLE_EMAIL_CONFIRMATIONS !== "false",
    ENABLE_EMAIL_CHANGE_CONFIRMATIONS: process.env.ENABLE_EMAIL_CHANGE_CONFIRMATIONS !== "false",
    
    // SMTP settings for Supabase
    SMTP_HOST: emailConfig.smtp.host,
    SMTP_PORT: emailConfig.smtp.port.toString(),
    SMTP_USER: emailConfig.smtp.user || "",
    SMTP_PASS: emailConfig.smtp.pass || "",
    SMTP_SENDER_NAME: emailConfig.from.name,
    SMTP_SENDER_EMAIL: emailConfig.from.email,
    
    // Email templates (these would be configured in Supabase dashboard)
    EMAIL_TEMPLATE_INVITE: process.env.EMAIL_TEMPLATE_INVITE,
    EMAIL_TEMPLATE_CONFIRMATION: process.env.EMAIL_TEMPLATE_CONFIRMATION,
    EMAIL_TEMPLATE_RECOVERY: process.env.EMAIL_TEMPLATE_RECOVERY,
    EMAIL_TEMPLATE_MAGIC_LINK: process.env.EMAIL_TEMPLATE_MAGIC_LINK,
    EMAIL_TEMPLATE_EMAIL_CHANGE: process.env.EMAIL_TEMPLATE_EMAIL_CHANGE,
  };
}

/**
 * Environment variables needed for email testing
 */
export function getEmailTestingEnvVars(): Record<string, string> {
  const config = getSupabaseAuthConfig();
  
  return {
    // Email testing control
    USE_EMAIL_TESTING: isEmailTestingEnabled().toString(),
    
    // Inbucket configuration
    INBUCKET_WEB_URL: INBUCKET_CONFIG.webUrl,
    INBUCKET_SMTP_HOST: INBUCKET_CONFIG.smtpHost,
    INBUCKET_SMTP_PORT: INBUCKET_CONFIG.smtpPort.toString(),
    INBUCKET_API_URL: INBUCKET_CONFIG.apiUrl,
    
    // Supabase SMTP configuration
    SMTP_HOST: config.SMTP_HOST,
    SMTP_PORT: config.SMTP_PORT,
    SMTP_USER: config.SMTP_USER,
    SMTP_PASS: config.SMTP_PASS,
    SMTP_SENDER_NAME: config.SMTP_SENDER_NAME,
    SMTP_SENDER_EMAIL: config.SMTP_SENDER_EMAIL,
    
    // Email confirmation settings
    ENABLE_EMAIL_CONFIRMATIONS: config.ENABLE_EMAIL_CONFIRMATIONS.toString(),
    ENABLE_EMAIL_CHANGE_CONFIRMATIONS: config.ENABLE_EMAIL_CHANGE_CONFIRMATIONS.toString(),
  };
}

/**
 * Validates that email testing configuration is correct
 */
export function validateEmailTestingConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isEmailTestingEnabled()) {
    // Check Inbucket configuration
    if (!INBUCKET_CONFIG.webUrl) {
      errors.push("INBUCKET_WEB_URL is not configured");
    }
    
    if (!INBUCKET_CONFIG.smtpHost) {
      errors.push("INBUCKET_SMTP_HOST is not configured");
    }
    
    if (!INBUCKET_CONFIG.smtpPort || isNaN(INBUCKET_CONFIG.smtpPort)) {
      errors.push("INBUCKET_SMTP_PORT is not configured or invalid");
    }

    // Check if running in test environment
    if (process.env.NODE_ENV !== "test") {
      warnings.push("Email testing is enabled but NODE_ENV is not 'test'");
    }

    // Check Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL is not configured");
    } else if (supabaseUrl.includes("supabase.co") && process.env.NODE_ENV === "test") {
      warnings.push("Using production Supabase URL in test environment");
    }
  } else {
    // Email testing is disabled
    if (process.env.NODE_ENV === "test") {
      warnings.push("Email testing is disabled in test environment");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs email configuration status
 */
export function logEmailConfigStatus(): void {
  const validation = validateEmailTestingConfig();
  const config = getEmailConfig();

  console.log("\n📧 Email Testing Configuration Status:");
  console.log(`   Enabled: ${isEmailTestingEnabled()}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  
  if (isEmailTestingEnabled()) {
    console.log(`   SMTP Host: ${config.smtp.host}:${config.smtp.port}`);
    console.log(`   From: ${config.from.name} <${config.from.email}>`);
    console.log(`   Inbucket Web UI: ${INBUCKET_CONFIG.webUrl}`);
  }

  if (validation.errors.length > 0) {
    console.log("\n❌ Configuration Errors:");
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log("\n⚠️ Configuration Warnings:");
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (validation.isValid && validation.warnings.length === 0) {
    console.log("✅ Email configuration is valid");
  }

  console.log("");
}

/**
 * Creates environment configuration for Playwright tests
 */
export function createPlaywrightEmailEnv(): Record<string, string> {
  const baseEnv = getEmailTestingEnvVars();
  
  return {
    ...baseEnv,
    // Ensure test environment
    NODE_ENV: "test",
    
    // Playwright specific
    PLAYWRIGHT_EMAIL_TESTING: "true",
    
    // Test database (if using local Supabase)
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres",
  };
}

/**
 * Helper to check if Supabase is configured for email testing
 */
export async function checkSupabaseEmailConfig(): Promise<{
  isConfigured: boolean;
  message: string;
}> {
  try {
    // This would typically check Supabase settings via API
    // For now, we'll check environment variables
    const config = getSupabaseAuthConfig();
    
    if (!config.SMTP_HOST || !config.SMTP_PORT) {
      return {
        isConfigured: false,
        message: "Supabase SMTP configuration is incomplete",
      };
    }

    if (isEmailTestingEnabled() && config.SMTP_HOST !== INBUCKET_CONFIG.smtpHost) {
      return {
        isConfigured: false,
        message: "Supabase is not configured to use Inbucket for testing",
      };
    }

    return {
      isConfigured: true,
      message: "Supabase email configuration is correct",
    };
  } catch (error) {
    return {
      isConfigured: false,
      message: `Error checking Supabase configuration: ${error}`,
    };
  }
}
