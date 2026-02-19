"use node";

/**
 * Email Finder Actions
 * Free email discovery and verification using pattern matching + SMTP validation
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import * as dns from "dns";
import * as net from "net";
import { promisify } from "util";

// Import pure functions from lib (non-Node functions)
import {
  generateEmailPermutations,
  validateEmailSyntax,
  isDisposableEmail,
  EMAIL_PATTERNS,
} from "./lib/emailFinder";

const resolveMx = promisify(dns.resolveMx);

interface EmailCheck {
  syntaxValid: boolean;
  mxRecordsExist: boolean;
  smtpVerified: boolean | null;
  catchAll: boolean | null;
  disposable: boolean;
}

interface EmailResult {
  email: string;
  confidence: "high" | "medium" | "low";
  pattern: string;
  verified: boolean;
  checks: EmailCheck;
}

interface EmailFinderResult {
  emails: EmailResult[];
  topMatch: string | null;
  allPossible: string[];
}

/**
 * Verify domain has MX records (can receive emails)
 */
async function verifyMXRecords(domain: string): Promise<boolean> {
  try {
    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * SMTP verification using RCPT TO command
 */
async function verifySMTP(email: string): Promise<{ code: number; message: string; valid: boolean }> {
  const domain = email.split("@")[1];
  if (!domain) {
    return { code: 0, message: "Invalid email format", valid: false };
  }

  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { code: 0, message: "No MX records found", valid: false };
    }

    mxRecords.sort((a, b) => a.priority - b.priority);
    const smtpServer = mxRecords[0].exchange;

    return new Promise((resolve) => {
      const client = net.createConnection(25, smtpServer);
      let buffer = "";
      let stage = 0;
      let responseCode = 0;

      const timeout = setTimeout(() => {
        client.destroy();
        resolve({ code: 0, message: "Connection timeout", valid: false });
      }, 10000);

      client.on("data", (data) => {
        buffer += data.toString();
        if (!buffer.endsWith("\r\n")) return;

        const lines = buffer.split("\r\n").filter(line => line.trim());
        const lastLine = lines[lines.length - 1];
        responseCode = parseInt(lastLine.substring(0, 3));
        buffer = "";

        if (stage === 0 && responseCode === 220) {
          client.write("HELO verify.local\r\n");
          stage = 1;
        } else if (stage === 1 && responseCode === 250) {
          client.write("MAIL FROM: <verify@verify.local>\r\n");
          stage = 2;
        } else if (stage === 2 && responseCode === 250) {
          client.write(`RCPT TO: <${email}>\r\n`);
          stage = 3;
        } else if (stage === 3) {
          clearTimeout(timeout);
          client.write("QUIT\r\n");
          client.end();
          const valid = responseCode === 250;
          resolve({ code: responseCode, message: lastLine.substring(4), valid });
        } else {
          clearTimeout(timeout);
          client.destroy();
          resolve({ code: responseCode, message: lastLine, valid: false });
        }
      });

      client.on("error", (err) => {
        clearTimeout(timeout);
        resolve({ code: 0, message: err.message, valid: false });
      });

      client.on("timeout", () => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ code: 0, message: "Connection timeout", valid: false });
      });
    });
  } catch (error: any) {
    return { code: 0, message: error.message, valid: false };
  }
}

/**
 * Test if domain is catch-all
 */
async function isCatchAllDomain(domain: string): Promise<boolean | null> {
  const randomEmail = `zzztest${Date.now()}${Math.random().toString(36).substring(7)}@${domain}`;
  try {
    const result = await verifySMTP(randomEmail);
    if (result.code === 250) return true;
    if (result.code === 550 || result.code === 551) return false;
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Rate-limited SMTP verification
 */
const verificationQueue: Map<string, number> = new Map();

async function rateLimitedSMTPVerify(email: string): Promise<{ code: number; message: string; valid: boolean }> {
  const domain = email.split("@")[1];
  const lastVerification = verificationQueue.get(domain) || 0;
  const now = Date.now();
  const timeSinceLastCheck = now - lastVerification;

  if (timeSinceLastCheck < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastCheck));
  }

  verificationQueue.set(domain, Date.now());
  return verifySMTP(email);
}

/**
 * Find email for a single person
 */
export const findSingleEmail = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    companyDomain: v.string(),
    knownPattern: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<EmailFinderResult> => {
    const allPossible = generateEmailPermutations({
      firstName: args.firstName,
      lastName: args.lastName,
      companyDomain: args.companyDomain,
      knownPattern: args.knownPattern,
    });

    const domain = args.companyDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

    // Filter by syntax and disposable check
    const validSyntax = allPossible.filter(email => {
      return validateEmailSyntax(email) && !isDisposableEmail(email);
    });

    if (validSyntax.length === 0) {
      return { emails: [], topMatch: null, allPossible };
    }

    // Check MX records for domain
    const mxRecordsExist = await verifyMXRecords(domain);
    if (!mxRecordsExist) {
      return {
        emails: validSyntax.map(email => ({
          email,
          confidence: "low" as const,
          pattern: "unknown",
          verified: false,
          checks: {
            syntaxValid: true,
            mxRecordsExist: false,
            smtpVerified: null,
            catchAll: null,
            disposable: false,
          },
        })),
        topMatch: null,
        allPossible,
      };
    }

    // Check for catch-all domain
    const catchAll = await isCatchAllDomain(domain);

    // Verify each email via SMTP
    const results: EmailResult[] = [];
    const first = args.firstName.toLowerCase().replace(/[^a-z]/g, "");
    const last = args.lastName.toLowerCase().replace(/[^a-z]/g, "");

    for (const email of validSyntax) {
      const pattern = EMAIL_PATTERNS.find(p => email === p.fn(first, last, domain));

      let smtpResult: { code: number; message: string; valid: boolean } | null = null;
      let confidence: "high" | "medium" | "low" = "low";

      try {
        smtpResult = await rateLimitedSMTPVerify(email);

        if (smtpResult.valid && !catchAll) {
          confidence = "high";
        } else if (smtpResult.valid && catchAll) {
          confidence = "medium";
        } else if (catchAll === null && mxRecordsExist) {
          confidence = "medium";
        } else {
          confidence = "low";
        }
      } catch (e) {
        if (args.knownPattern && pattern?.name === args.knownPattern) {
          confidence = "medium";
        }
      }

      results.push({
        email,
        confidence,
        pattern: pattern?.name || "unknown",
        verified: smtpResult?.valid || false,
        checks: {
          syntaxValid: true,
          mxRecordsExist,
          smtpVerified: smtpResult?.valid || null,
          catchAll,
          disposable: false,
        },
      });
    }

    // Sort by confidence
    results.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });

    return {
      emails: results,
      topMatch: results.find(r => r.confidence === "high")?.email || results[0]?.email || null,
      allPossible,
    };
  },
});

/**
 * Find emails for multiple people at same company (batch mode)
 */
export const findBatchEmails = action({
  args: {
    people: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
      })
    ),
    companyDomain: v.string(),
  },
  handler: async (ctx, args) => {
    const results: Record<string, EmailFinderResult> = {};
    let detectedPattern: string | undefined;

    for (const person of args.people) {
      const key = `${person.firstName} ${person.lastName}`;

      // Call the single email finder logic directly instead of using runAction
      const allPossible = generateEmailPermutations({
        firstName: person.firstName,
        lastName: person.lastName,
        companyDomain: args.companyDomain,
        knownPattern: detectedPattern,
      });

      const domain = args.companyDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

      const validSyntax = allPossible.filter(email => {
        return validateEmailSyntax(email) && !isDisposableEmail(email);
      });

      if (validSyntax.length === 0) {
        results[key] = { emails: [], topMatch: null, allPossible };
        continue;
      }

      const mxRecordsExist = await verifyMXRecords(domain);
      if (!mxRecordsExist) {
        results[key] = {
          emails: validSyntax.map(email => ({
            email,
            confidence: "low" as const,
            pattern: "unknown",
            verified: false,
            checks: {
              syntaxValid: true,
              mxRecordsExist: false,
              smtpVerified: null,
              catchAll: null,
              disposable: false,
            },
          })),
          topMatch: null,
          allPossible,
        };
        continue;
      }

      const catchAll = await isCatchAllDomain(domain);
      const emailResults: EmailResult[] = [];
      const first = person.firstName.toLowerCase().replace(/[^a-z]/g, "");
      const last = person.lastName.toLowerCase().replace(/[^a-z]/g, "");

      for (const email of validSyntax) {
        const pattern = EMAIL_PATTERNS.find(p => email === p.fn(first, last, domain));

        let smtpResult: { code: number; message: string; valid: boolean } | null = null;
        let confidence: "high" | "medium" | "low" = "low";

        try {
          smtpResult = await rateLimitedSMTPVerify(email);

          if (smtpResult.valid && !catchAll) {
            confidence = "high";
          } else if (smtpResult.valid && catchAll) {
            confidence = "medium";
          } else if (catchAll === null && mxRecordsExist) {
            confidence = "medium";
          } else {
            confidence = "low";
          }
        } catch (e) {
          if (detectedPattern && pattern?.name === detectedPattern) {
            confidence = "medium";
          }
        }

        emailResults.push({
          email,
          confidence,
          pattern: pattern?.name || "unknown",
          verified: smtpResult?.valid || false,
          checks: {
            syntaxValid: true,
            mxRecordsExist,
            smtpVerified: smtpResult?.valid || null,
            catchAll,
            disposable: false,
          },
        });
      }

      emailResults.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      });

      const result: EmailFinderResult = {
        emails: emailResults,
        topMatch: emailResults.find(r => r.confidence === "high")?.email || emailResults[0]?.email || null,
        allPossible,
      };

      if (!detectedPattern && result.topMatch) {
        const topResult = result.emails.find((e: EmailResult) => e.email === result.topMatch);
        if (topResult && topResult.confidence === "high") {
          detectedPattern = topResult.pattern;
        }
      }

      results[key] = result;
    }

    return results;
  },
});
