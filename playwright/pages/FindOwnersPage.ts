import { Page, expect } from '@playwright/test';

export class FindOwnersPage {
  constructor(private page: Page) {}

  private get lastNameInput() {
    return this.page.locator('[data-pw="find-owner-lastname"]');
  }
  private get findOwnerButton() {
    return this.page.locator('[data-pw="find-owner-submit"]');
  }
  private get addOwnerButton() {
    // The Add Owner button is an <a> with data-pw
    return this.page.locator('a[data-pw="owner-add-link"]');
  }
  private get paginationLinks() {
    return this.page.locator('[data-pw="owners-pagination-link"]');
  }
  private get paginationFirst() {
    return this.page.locator('[data-pw="owners-pagination-first"]');
  }
  private get paginationPrev() {
    return this.page.locator('[data-pw="owners-pagination-prev"]');
  }
  private get paginationNext() {
    return this.page.locator('[data-pw="owners-pagination-next"]');
  }
  private get paginationLast() {
    return this.page.locator('[data-pw="owners-pagination-last"]');
  }
  private get ownerDetailLinks() {
    return this.page.locator('[data-pw="owner-detail-link"]');
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
    // Use data-pw for next page
    if (await this.paginationNext.isVisible()) {
      await this.paginationNext.click();
      await this.page.waitForLoadState('networkidle');
      return true;
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
    let pageNumbers: number[] = [];
    const pageLinks = await this.paginationLinks.allTextContents();
    pageNumbers = pageLinks.map(text => parseInt(text, 10)).filter(num => !isNaN(num));
    if (pageNumbers.length === 0) pageNumbers = [1];
    // Sortiere und entferne Duplikate
    pageNumbers = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
    for (const pageNum of pageNumbers) {
      if (pageNum !== 1) {
        const pageLink = this.paginationLinks.filter({ hasText: String(pageNum) });
        if (await pageLink.count() > 0) {
          await pageLink.first().click();
          await this.page.waitForLoadState('networkidle');
        }
      }
      const ownerRows = await this.page.locator('table tbody tr').all();
      for (let i = 0; i < ownerRows.length; i++) {
        const row = ownerRows[i];
        const nameCell = await row.locator('td').nth(0).innerText();
        const nameParts = nameCell.trim().split(/\s+/);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
        if (lastName.charAt(0).toUpperCase() === filter.toUpperCase()) {
          const href = await row.locator('[data-pw="owner-detail-link"]').first().getAttribute('href');
          if (href) ownerHrefs.push(href);
        }
      }
    }
    return ownerHrefs;
  }
}
