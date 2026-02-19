/**
 * Email Finder Pure Functions (No Node.js dependencies)
 * Pattern generation and validation utilities
 */

export interface EmailFinderInput {
  firstName: string;
  lastName: string;
  companyDomain: string;
  knownPattern?: string;
}

/**
 * Common corporate email patterns in order of popularity
 */
export const EMAIL_PATTERNS = [
  { name: "firstname.lastname", fn: (f: string, l: string, d: string) => `${f}.${l}@${d}` },
  { name: "firstinitial.lastname", fn: (f: string, l: string, d: string) => `${f[0]}.${l}@${d}` },
  { name: "firstname", fn: (f: string, l: string, d: string) => `${f}@${d}` },
  { name: "flast", fn: (f: string, l: string, d: string) => `${f[0]}${l}@${d}` },
  { name: "firstname_lastname", fn: (f: string, l: string, d: string) => `${f}_${l}@${d}` },
  { name: "lastname.firstname", fn: (f: string, l: string, d: string) => `${l}.${f}@${d}` },
  { name: "firstnamelast", fn: (f: string, l: string, d: string) => `${f}${l}@${d}` },
  { name: "firstname-lastname", fn: (f: string, l: string, d: string) => `${f}-${l}@${d}` },
];

/**
 * Known disposable email domains (subset)
 */
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "guerrillamail.com", "mailinator.com", "tempmail.com",
  "throwaway.email", "maildrop.cc", "yopmail.com", "getnada.com",
  "temp-mail.org", "fakeinbox.com", "sharklasers.com", "grr.la",
]);

/**
 * Generate all possible email variations based on common patterns
 */
export function generateEmailPermutations(input: EmailFinderInput): string[] {
  const first = input.firstName.toLowerCase().replace(/[^a-z]/g, "");
  const last = input.lastName.toLowerCase().replace(/[^a-z]/g, "");
  const domain = input.companyDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

  const emails: string[] = [];

  if (input.knownPattern) {
    const pattern = EMAIL_PATTERNS.find(p => p.name === input.knownPattern);
    if (pattern) {
      emails.push(pattern.fn(first, last, domain));
    }
  }

  for (const pattern of EMAIL_PATTERNS) {
    try {
      const email = pattern.fn(first, last, domain);
      if (!emails.includes(email)) {
        emails.push(email);
      }
    } catch (e) {
      // Skip invalid patterns
    }
  }

  return emails;
}

/**
 * Validate email syntax using regex
 */
export function validateEmailSyntax(email: string): boolean {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

  if (!regex.test(email)) return false;
  if (email.includes("..")) return false;
  if (email.startsWith(".") || email.endsWith(".")) return false;

  return true;
}

/**
 * Check if domain is a known disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}
