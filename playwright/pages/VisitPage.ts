import { Page, expect } from '@playwright/test';

export class VisitPage {
  constructor(private page: Page) {}

  private get dateInput() {
    return this.page.getByTestId('date');
  }
  private get descriptionInput() {
    return this.page.getByTestId('description');
  }
  private get addVisitButton() {
    return this.page.getByRole('button', { name: 'Add Visit' });
  }
  private get visitTable() {
    // Selektiere die erste Tabelle mit der Klasse 'table-condensed' (Visits)
    return this.page.locator('table.table-condensed').first();
  }

  async addVisit({ date, description }: { date: string, description: string }) {
    await this.dateInput.fill(date);
    await this.descriptionInput.fill(description);
    await this.addVisitButton.click();
  }

  async expectVisit(description: string) {
    await expect(this.visitTable).toContainText(description);
  }
}
