import { Page, expect } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Environment variable to control email testing
 * Set USE_EMAIL_TESTING=true to enable email interception
 * Set USE_EMAIL_TESTING=false to skip email testing
 */
export const isEmailTestingEnabled = (): boolean => {
  const envValue = process.env.USE_EMAIL_TESTING;
  if (envValue === undefined) {
    // Default to true if not specified
    return true;
  }
  return envValue.toLowerCase() === "true";
};

/**
 * Inbucket configuration
 */
export const INBUCKET_CONFIG = {
  webUrl: process.env.INBUCKET_WEB_URL || "http://localhost:9000",
  smtpHost: process.env.INBUCKET_SMTP_HOST || "localhost",
  smtpPort: parseInt(process.env.INBUCKET_SMTP_PORT || "2500"),
  apiUrl: process.env.INBUCKET_API_URL || "http://localhost:9000/api/v1",
};

/**
 * Email message interface
 */
export interface EmailMessage {
  id: string;
  mailbox: string;
  from: string;
  to: string[];
  subject: string;
  date: string;
  size: number;
  body?: {
    text?: string;
    html?: string;
  };
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

/**
 * Email testing configuration
 */
export interface EmailTestConfig {
  /** Timeout for waiting for emails (in milliseconds) */
  timeout?: number;
  /** Whether to use soft assertions */
  useSoftAssertions?: boolean;
  /** Custom test name for reporting */
  testName?: string;
  /** Whether to clear mailbox before test */
  clearMailbox?: boolean;
}

/**
 * Default email test configuration
 */
export const defaultEmailConfig: EmailTestConfig = {
  timeout: 30000, // 30 seconds
  useSoftAssertions: true,
  clearMailbox: true,
};

/**
 * Starts the Inbucket service using Docker Compose
 */
export async function startInbucketService(): Promise<void> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping Inbucket startup");
    return;
  }

  try {
    console.log("🚀 Starting Inbucket email service...");
    await execAsync("docker-compose -f docker-compose.test.yml up -d inbucket");

    // Wait for service to be ready
    await waitForInbucketReady();
    console.log("✅ Inbucket service started successfully");
  } catch (error) {
    console.error("❌ Failed to start Inbucket service:", error);
    throw error;
  }
}

/**
 * Stops the Inbucket service
 */
export async function stopInbucketService(): Promise<void> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping Inbucket shutdown");
    return;
  }

  try {
    console.log("🛑 Stopping Inbucket email service...");
    await execAsync("docker-compose -f docker-compose.test.yml down");
    console.log("✅ Inbucket service stopped successfully");
  } catch (error) {
    console.error("❌ Failed to stop Inbucket service:", error);
    throw error;
  }
}

/**
 * Waits for Inbucket service to be ready
 */
export async function waitForInbucketReady(
  timeout: number = 30000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(
        `${INBUCKET_CONFIG.apiUrl}/monitor/messages`
      );
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Inbucket service not ready after ${timeout}ms`);
}

/**
 * Clears all emails from a specific mailbox
 */
export async function clearMailbox(
  emailAddress: string,
  config: EmailTestConfig = {}
): Promise<void> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping mailbox clear");
    return;
  }

  const { useSoftAssertions = true } = { ...defaultEmailConfig, ...config };
  const mailbox = emailAddress.split("@")[0];

  try {
    const response = await fetch(
      `${INBUCKET_CONFIG.apiUrl}/mailbox/${mailbox}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const error = `Failed to clear mailbox ${mailbox}: ${response.statusText}`;
      if (useSoftAssertions) {
        console.warn(error);
      } else {
        throw new Error(error);
      }
    } else {
      console.log(`📧 Cleared mailbox for ${emailAddress}`);
    }
  } catch (error) {
    const errorMsg = `Error clearing mailbox ${mailbox}: ${error}`;
    if (useSoftAssertions) {
      console.warn(errorMsg);
    } else {
      throw new Error(errorMsg);
    }
  }
}

/**
 * Retrieves all emails from a specific mailbox
 */
export async function getEmailsFromMailbox(
  emailAddress: string,
  config: EmailTestConfig = {}
): Promise<EmailMessage[]> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - returning empty email list");
    return [];
  }

  const { useSoftAssertions = true } = { ...defaultEmailConfig, ...config };
  const mailbox = emailAddress.split("@")[0];

  try {
    const response = await fetch(
      `${INBUCKET_CONFIG.apiUrl}/mailbox/${mailbox}`
    );

    if (!response.ok) {
      const error = `Failed to fetch emails from mailbox ${mailbox}: ${response.statusText}`;
      if (useSoftAssertions) {
        console.warn(error);
        return [];
      } else {
        throw new Error(error);
      }
    }

    const emails = await response.json();
    console.log(`📧 Retrieved ${emails.length} emails from ${emailAddress}`);
    return emails;
  } catch (error) {
    const errorMsg = `Error fetching emails from mailbox ${mailbox}: ${error}`;
    if (useSoftAssertions) {
      console.warn(errorMsg);
      return [];
    } else {
      throw new Error(errorMsg);
    }
  }
}

/**
 * Retrieves a specific email by ID
 */
export async function getEmailById(
  emailAddress: string,
  emailId: string,
  config: EmailTestConfig = {}
): Promise<EmailMessage | null> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - returning null email");
    return null;
  }

  const { useSoftAssertions = true } = { ...defaultEmailConfig, ...config };
  const mailbox = emailAddress.split("@")[0];

  try {
    const response = await fetch(
      `${INBUCKET_CONFIG.apiUrl}/mailbox/${mailbox}/${emailId}`
    );

    if (!response.ok) {
      const error = `Failed to fetch email ${emailId} from mailbox ${mailbox}: ${response.statusText}`;
      if (useSoftAssertions) {
        console.warn(error);
        return null;
      } else {
        throw new Error(error);
      }
    }

    const email = await response.json();
    console.log(`📧 Retrieved email ${emailId} from ${emailAddress}`);
    return email;
  } catch (error) {
    const errorMsg = `Error fetching email ${emailId} from mailbox ${mailbox}: ${error}`;
    if (useSoftAssertions) {
      console.warn(errorMsg);
      return null;
    } else {
      throw new Error(errorMsg);
    }
  }
}

/**
 * Waits for an email to arrive in the specified mailbox
 */
export async function waitForEmail(
  emailAddress: string,
  config: EmailTestConfig = {}
): Promise<EmailMessage | null> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping email wait");
    return null;
  }

  const {
    timeout = 30000,
    useSoftAssertions = true,
    testName,
    clearMailbox: shouldClearMailbox = false,
  } = { ...defaultEmailConfig, ...config };

  if (shouldClearMailbox) {
    await clearMailbox(emailAddress, config);
  }

  const startTime = Date.now();
  const mailbox = emailAddress.split("@")[0];

  console.log(
    `⏳ Waiting for email to arrive at ${emailAddress}${
      testName ? ` (${testName})` : ""
    }...`
  );

  while (Date.now() - startTime < timeout) {
    try {
      const emails = await getEmailsFromMailbox(emailAddress, config);

      if (emails.length > 0) {
        const latestEmail = emails[0]; // Inbucket returns emails in reverse chronological order
        console.log(
          `✅ Email received: "${latestEmail.subject}" from ${latestEmail.from}`
        );
        return latestEmail;
      }
    } catch (error) {
      console.warn(`Error checking for emails: ${error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const errorMsg = `No email received at ${emailAddress} within ${timeout}ms${
    testName ? ` (${testName})` : ""
  }`;

  if (useSoftAssertions) {
    console.warn(`⚠️ ${errorMsg}`);
    return null;
  } else {
    throw new Error(errorMsg);
  }
}

/**
 * Waits for an email with specific criteria
 */
export async function waitForEmailWithSubject(
  emailAddress: string,
  subjectPattern: string | RegExp,
  config: EmailTestConfig = {}
): Promise<EmailMessage | null> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping email wait");
    return null;
  }

  const {
    timeout = 30000,
    useSoftAssertions = true,
    testName,
    clearMailbox: shouldClearMailbox = false,
  } = { ...defaultEmailConfig, ...config };

  if (shouldClearMailbox) {
    await clearMailbox(emailAddress, config);
  }

  const startTime = Date.now();
  const pattern =
    typeof subjectPattern === "string"
      ? new RegExp(subjectPattern, "i")
      : subjectPattern;

  console.log(
    `⏳ Waiting for email with subject matching "${subjectPattern}" at ${emailAddress}${
      testName ? ` (${testName})` : ""
    }...`
  );

  while (Date.now() - startTime < timeout) {
    try {
      const emails = await getEmailsFromMailbox(emailAddress, config);

      const matchingEmail = emails.find((email) => pattern.test(email.subject));

      if (matchingEmail) {
        console.log(
          `✅ Email found: "${matchingEmail.subject}" from ${matchingEmail.from}`
        );
        return matchingEmail;
      }
    } catch (error) {
      console.warn(`Error checking for emails: ${error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const errorMsg = `No email with subject matching "${subjectPattern}" received at ${emailAddress} within ${timeout}ms${
    testName ? ` (${testName})` : ""
  }`;

  if (useSoftAssertions) {
    console.warn(`⚠️ ${errorMsg}`);
    return null;
  } else {
    throw new Error(errorMsg);
  }
}

/**
 * Validates email content
 */
export async function validateEmailContent(
  email: EmailMessage,
  validations: {
    subject?: string | RegExp;
    from?: string | RegExp;
    to?: string | RegExp;
    bodyText?: string | RegExp;
    bodyHtml?: string | RegExp;
    hasAttachments?: boolean;
    attachmentCount?: number;
  },
  config: EmailTestConfig = {}
): Promise<void> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping email validation");
    return;
  }

  const { useSoftAssertions = true, testName } = {
    ...defaultEmailConfig,
    ...config,
  };

  console.log(
    `🔍 Validating email content${testName ? ` (${testName})` : ""}...`
  );

  try {
    // Validate subject
    if (validations.subject) {
      const pattern =
        typeof validations.subject === "string"
          ? new RegExp(validations.subject, "i")
          : validations.subject;

      if (useSoftAssertions) {
        expect.soft(email.subject).toMatch(pattern);
      } else {
        expect(email.subject).toMatch(pattern);
      }
    }

    // Validate from
    if (validations.from) {
      const pattern =
        typeof validations.from === "string"
          ? new RegExp(validations.from, "i")
          : validations.from;

      if (useSoftAssertions) {
        expect.soft(email.from).toMatch(pattern);
      } else {
        expect(email.from).toMatch(pattern);
      }
    }

    // Validate to
    if (validations.to) {
      const pattern =
        typeof validations.to === "string"
          ? new RegExp(validations.to, "i")
          : validations.to;

      const toAddresses = Array.isArray(email.to)
        ? email.to.join(", ")
        : email.to;

      if (useSoftAssertions) {
        expect.soft(toAddresses).toMatch(pattern);
      } else {
        expect(toAddresses).toMatch(pattern);
      }
    }

    // Get email body if not already loaded
    if ((validations.bodyText || validations.bodyHtml) && !email.body) {
      // We need to fetch the full email content
      const fullEmail = await getEmailById(
        email.to[0] || email.mailbox,
        email.id,
        config
      );
      if (fullEmail) {
        email.body = fullEmail.body;
      }
    }

    // Validate body text
    if (validations.bodyText && email.body?.text) {
      const pattern =
        typeof validations.bodyText === "string"
          ? new RegExp(validations.bodyText, "i")
          : validations.bodyText;

      if (useSoftAssertions) {
        expect.soft(email.body.text).toMatch(pattern);
      } else {
        expect(email.body.text).toMatch(pattern);
      }
    }

    // Validate body HTML
    if (validations.bodyHtml && email.body?.html) {
      const pattern =
        typeof validations.bodyHtml === "string"
          ? new RegExp(validations.bodyHtml, "i")
          : validations.bodyHtml;

      if (useSoftAssertions) {
        expect.soft(email.body.html).toMatch(pattern);
      } else {
        expect(email.body.html).toMatch(pattern);
      }
    }

    // Validate attachments
    if (validations.hasAttachments !== undefined) {
      const hasAttachments = email.attachments && email.attachments.length > 0;

      if (useSoftAssertions) {
        expect.soft(hasAttachments).toBe(validations.hasAttachments);
      } else {
        expect(hasAttachments).toBe(validations.hasAttachments);
      }
    }

    if (validations.attachmentCount !== undefined) {
      const attachmentCount = email.attachments ? email.attachments.length : 0;

      if (useSoftAssertions) {
        expect.soft(attachmentCount).toBe(validations.attachmentCount);
      } else {
        expect(attachmentCount).toBe(validations.attachmentCount);
      }
    }

    console.log(
      `✅ Email validation passed${testName ? ` (${testName})` : ""}`
    );
  } catch (error) {
    const errorMsg = `Email validation failed${
      testName ? ` (${testName})` : ""
    }: ${error}`;
    if (useSoftAssertions) {
      console.warn(`⚠️ ${errorMsg}`);
    } else {
      throw new Error(errorMsg);
    }
  }
}

/**
 * Comprehensive email test that waits for email and validates content
 */
export async function waitForAndValidateEmail(
  emailAddress: string,
  validations: {
    subject?: string | RegExp;
    from?: string | RegExp;
    to?: string | RegExp;
    bodyText?: string | RegExp;
    bodyHtml?: string | RegExp;
    hasAttachments?: boolean;
    attachmentCount?: number;
  },
  config: EmailTestConfig = {}
): Promise<EmailMessage | null> {
  if (!isEmailTestingEnabled()) {
    console.log("Email testing disabled - skipping email wait and validation");
    return null;
  }

  const email = await waitForEmail(emailAddress, config);

  if (email) {
    await validateEmailContent(email, validations, config);
  }

  return email;
}

/**
 * Email test decorator for test functions
 * Adds email testing setup and teardown
 */
export function withEmailTesting(testName: string) {
  return `${testName} @email`;
}
