import { test, expect, request } from '@playwright/test';

test('Jira-Kommentar via API hinzufügen', async ({ request }) => {
  // Ersetze 'PET-1' ggf. durch ein existierendes Issue-Key
  const response = await request.post('http://localhost:8080/api/jira/issues/PET-1/comments', {
    data: { comment: 'Dies ist ein Test-Kommentar via API.' }
  });
  let errorText = '';
  if (!response.ok()) {
    errorText = `Status: ${response.status()}\nBody: ${await response.text()}`;
  }
  expect(response.ok(), errorText).toBeTruthy();
  const body = await response.json();
  expect(body).toBeDefined();
  expect(body.body).toContain('Test-Kommentar');
});
