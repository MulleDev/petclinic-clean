import { Page, expect } from '@playwright/test';

export class FindOwnersPage {
  constructor(private page: Page) {}

  private get lastNameInput() {
    return this.page.locator('[data-pw="find-owner-lastname"]');
  }
  private get findOwnerButton() {
    return this.page.getByRole('button', { name: 'Find Owner' });
  }
  private get addOwnerButton() {
    return this.page.getByRole('link', { name: 'Add Owner' });
  }

  async searchOwner(lastName: string) {
    await this.lastNameInput.fill(lastName);
    await this.findOwnerButton.click();
  }

  async gotoAddOwner() {
    await this.addOwnerButton.click();
  }

  async expectOnPage() {
    await expect(this.page.getByRole('heading', { name: 'Find Owners' })).toBeVisible();
  }

  async gotoNextPage() {
    // Finde alle Pagination-Links, die eine Zahl sind
    const pageLinks = await this.page.locator('a').allTextContents();
    const pageNumbers = pageLinks
      .map(text => parseInt(text, 10))
      .filter(num => !isNaN(num));
    if (pageNumbers.length === 0) return false;

    // Ermittle die aktuelle Seite
    const paginationText = await this.page.locator('text=pages [').textContent();
    const match = paginationText && paginationText.match(/\[\s*(\d+)/);
    let currentPage = 1;
    if (match && match[1]) {
      currentPage = parseInt(match[1], 10);
    }

    // Gibt es eine höhere Seitenzahl?
    const nextPageNum = Math.min(...pageNumbers.filter(n => n > currentPage));
    if (nextPageNum && nextPageNum > currentPage) {
      const nextPageLink = this.page.locator(`a:text-is('${nextPageNum}')`);
      try {
        if (await nextPageLink.first().isVisible()) {
          await nextPageLink.first().click();
          await this.page.waitForLoadState('networkidle');
          return true;
        }
      } catch (e) {
        // Link existiert nicht oder ist nicht sichtbar
      }
    }
    return false;
  }

  /**
   * Gibt alle Owner-Detail-Links zurück, deren Nachname mit dem angegebenen Filter-Buchstaben beginnt.
   * Geht jede Seite gezielt nur einmal durch, um Endlosschleifen zu vermeiden.
   */
  async getOwnerDetailLinksByLastNameMatch(filter: string): Promise<string[]> {
    const ownerHrefs: string[] = [];
    // Gehe zur ersten Seite
    await this.page.goto(this.page.url().split('?')[0]);
    await this.page.waitForLoadState('networkidle');
    // Sammle alle Seitenzahlen
    let paginationLinks = await this.page.locator('a').allTextContents();
    let pageNumbers = paginationLinks
      .map(text => parseInt(text, 10))
      .filter(num => !isNaN(num));
    if (pageNumbers.length === 0) pageNumbers = [1];
    // Sortiere und entferne Duplikate
    pageNumbers = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
    for (const pageNum of pageNumbers) {
      if (pageNum !== 1) {
        const pageLink = this.page.locator(`a:text-is('${pageNum}')`);
        if (await pageLink.count() > 0) {
          await pageLink.first().click();
          await this.page.waitForLoadState('networkidle');
        }
      }
      const ownerRows = await this.page.locator('table tbody tr').all();
      for (let i = 0; i < ownerRows.length; i++) {
        const row = ownerRows[i];
        const lastNameCell = await row.locator('td').nth(0).innerText();
        const nameParts = lastNameCell.trim().split(/\s+/);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
        if (lastName.charAt(0).toUpperCase() === filter.toUpperCase()) {
          const href = await row.locator('a').first().getAttribute('href');
          if (href) ownerHrefs.push(href);
        }
      }
    }
    return ownerHrefs;
  }
}
