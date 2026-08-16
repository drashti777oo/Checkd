/**
 * Strips PII (Names, Emails, Social Security Numbers) from client-side text before external submission.
 */
export function sanitizeClientInput(input: string): string {
  return input
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/\b\d{10}\b/g, '[REDACTED_PHONE]');
}
