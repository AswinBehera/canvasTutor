import { test, expect } from '@playwright/test';

test('capture browser errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });

  await page.goto('http://localhost:5173');

  // Give some time for potential errors to appear after page load
  await page.waitForTimeout(5000);

  if (errors.length > 0) {
    console.error('\n--- Captured Browser Errors ---');
    errors.forEach(error => console.error(error));
    console.error('-------------------------------');
  } else {
    console.log('No browser errors captured.');
  }

  // Optionally, assert that no errors were found if this is a test for error absence
  // expect(errors).toEqual([]);
});
