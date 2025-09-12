import { test, expect } from '@playwright/test';

test.describe('Homepage Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Base URL is configured in playwright.config.ts
  });

  test('should navigate to Features page', async ({ page }) => {
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL('/features');
    await expect(page.getByRole('heading', { name: 'Our Features' })).toBeVisible();
  });

  test('should navigate to Pricing page', async ({ page }) => {
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { name: 'Pricing Plans' })).toBeVisible();
  });

  test('should navigate to About Us page', async ({ page }) => {
    await page.getByRole('link', { name: 'About Us' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { name: 'About CanvasTutor' })).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });

  test('should navigate to Login page', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Login to CanvasTutor' })).toBeVisible();
  });

  test('should navigate to Get Started page from header', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/get-started');
    await expect(page.getByRole('heading', { name: 'Start Your System Design' })).toBeVisible();
  });

  test('should navigate to Get Started page from hero section', async ({ page }) => {
    await page.getByRole('link', { name: 'Start Building Your System' }).click();
    await expect(page).toHaveURL('/get-started');
    await expect(page.getByRole('heading', { name: 'Start Your System Design' })).toBeVisible();
  });

  test('should navigate to Get Started page from bottom CTA', async ({ page }) => {
    await page.getByRole('link', { name: 'Get Started for Free' }).click();
    await expect(page).toHaveURL('/get-started');
    await expect(page.getByRole('heading', { name: 'Start Your System Design' })).toBeVisible();
  });

  test('should navigate to home page from logo', async ({ page }) => {
    // First navigate to another page
    await page.goto('/features');
    await expect(page).toHaveURL('/features');

    // Click the logo to go home
    await page.getByRole('link', { name: 'CanvasTutor' }).first().click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Visualize, Simulate, and Master System Architecture.' })).toBeVisible();
  });
});
