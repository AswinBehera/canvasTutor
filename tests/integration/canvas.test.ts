import { test, expect } from '@playwright/test';

test.describe('Canvas Integration', () => {
  test('drag and drop creates a node on the canvas', async ({ page }) => {
    // 1. Navigate to the input page
    await page.goto('http://localhost:5173/get-started');

    // 2. Fill the input and generate components
    await page.getByPlaceholder('Describe your application in a few sentences.').fill('A simple blog with user authentication.');
    await page.getByRole('button', { name: 'Generate Components' }).click();

    // 3. Wait for navigation to the canvas page
    await page.waitForURL('http://localhost:5173/canvas');

    // 4. Get the initial number of nodes on the canvas
    // We need a way to count nodes. Assuming custom nodes have a specific data-testid or class.
    // For now, let's assume the initial nodes are rendered directly from the LLM output.
    // We can count the number of elements that represent nodes.
    const initialNodeCount = await page.locator('.react-flow__node').count();

    // 5. Identify a component in the ComponentsPalette
    // Assuming ComponentCard has a specific class or data-testid
    // Let's try to find the first component card by its label
    const componentToDrag = page.locator('.component-card').first(); // Assuming a class 'component-card'
    // Or by text content if labels are unique enough
    // const componentToDrag = page.getByText('Frontend').first();

    // Ensure the component card is visible
    await expect(componentToDrag).toBeVisible();

    // 6. Identify the Canvas area
    // Assuming the ReactFlow wrapper has a specific class or data-testid
    const canvasArea = page.locator('.react-flow__pane'); // React Flow's default pane class

    // Ensure the canvas area is visible
    await expect(canvasArea).toBeVisible();

    // 7. Simulate drag-and-drop
    // Playwright's dragAndDrop is a high-level action
    await componentToDrag.dragTo(canvasArea);

    // 8. Assert that a new node is created on the canvas
    // Wait for the number of nodes to increase
    await page.waitForFunction(count => document.querySelectorAll('.react-flow__node').length > count, initialNodeCount);
    const newNodeCount = await page.locator('.react-flow__node').count();
    expect(newNodeCount).toBeGreaterThan(initialNodeCount);
  });
});
