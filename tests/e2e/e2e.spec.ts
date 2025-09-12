
import { test, expect } from '@playwright/test';

test.describe('CanvasTutor End-to-End Flow', () => {
  test('user can create, simulate, and export a system', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('http://localhost:5173'); // Assuming your Vite app runs on port 5173

    // 2. Input description
    await page.getByPlaceholder('What do you want to build?').fill('A social media app');
    await page.getByRole('button', { name: 'Generate Components' }).click();

    // 3. Drag and Drop
    await page.waitForSelector('text=Authentication');
    const authComponent = page.getByText('Authentication');
    const canvas = page.locator('.react-flow__pane'); // Assuming this is the canvas area

    // Simulate drag and drop
    await authComponent.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();

    // Verify node is created on canvas
    await expect(page.locator('.react-flow__node', { hasText: 'Authentication' })).toBeVisible();

    // 4. Run Simulation
    await page.getByRole('button', { name: 'Play Simulation' }).click();

    // 5. Verify Simulation Results
    await expect(page.getByText(/Responsiveness:/)).toBeVisible();
    await expect(page.getByText(/Cost:/)).toBeVisible();

    // 6. Export Specification
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ]);

    // 7. Verify Exported JSON content
    const path = await download.path();
    if (path) {
      const fs = require('fs');
      const fileContent = fs.readFileSync(path, 'utf-8');
      const parsedContent = JSON.parse(fileContent);
      expect(parsedContent.canvas.nodes.length).toBeGreaterThan(0);
      expect(parsedContent.components.length).toBeGreaterThan(0);
      expect(parsedContent.userInput).toContain('A social media app');
    } else {
      throw new Error('Download path is undefined');
    }
  });
});
