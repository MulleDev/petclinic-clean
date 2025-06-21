// TestUtils.ts
// Hilfsfunktionen für Playwright-Tests

export function toAbsoluteUrl(pageUrl: string, href: string): string {
  return href.startsWith('http') ? href : new URL(href, pageUrl).toString();
}
