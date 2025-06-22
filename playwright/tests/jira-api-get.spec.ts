import { test, expect, request } from '@playwright/test';

test('Jira-Issue via API abfragen', async ({ request }) => {
  // Ersetze 'PET-1' ggf. durch ein existierendes Issue-Key
  const response = await request.get('http://localhost:8080/api/jira/issues/PET-1');
  let errorText = '';
  if (!response.ok()) {
    errorText = `Status: ${response.status()}\nBody: ${await response.text()}`;
    console.error(errorText);
  }
  expect(response.ok(), errorText).toBeTruthy();
  const body = await response.json();
  console.log('API Response:', body);
  expect(body).toBeDefined();
  expect(body.fields).toBeDefined();
  expect(body.fields.summary).toBeDefined();
  expect(body.fields.status).toBeDefined();
});
