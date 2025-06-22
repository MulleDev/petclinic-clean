import { test, expect, request } from '@playwright/test';
import testData from '../fixtures/jira-issue.json';

test('Jira-Issue via API anlegen', async ({ request }) => {
  const response = await request.post('http://localhost:8080/api/jira/issues', {
    data: testData
  });
  let errorText = '';
  if (!response.ok()) {
    errorText = `Status: ${response.status()}\nBody: ${await response.text()}`;
  }
  expect(response.ok(), errorText).toBeTruthy();
  const body = await response.json();
  console.log('API Response:', body);
  expect(body.key).toBeDefined();
});
