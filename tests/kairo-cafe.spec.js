const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5003/tool/kairo-cafe';

test.describe('开罗创意咖啡店攻略', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test('页面加载成功', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('开罗创意咖啡店攻略');
        await expect(page.locator('#tab-complaints')).toBeVisible();
        await expect(page.locator('#tab-recipes')).toBeVisible();
    });

    test('顾客烦恼Tab默认显示', async ({ page }) => {
        await expect(page.locator('#panel-complaints')).toBeVisible();
        await expect(page.locator('#panel-recipes')).toBeHidden();
    });

    test('Tab切换功能', async ({ page }) => {
        await page.click('#tab-recipes');
        await expect(page.locator('#panel-recipes')).toBeVisible();
        await expect(page.locator('#panel-complaints')).toBeHidden();

        await page.click('#tab-complaints');
        await expect(page.locator('#panel-complaints')).toBeVisible();
        await expect(page.locator('#panel-recipes')).toBeHidden();
    });

    test('顾客烦恼搜索功能', async ({ page }) => {
        await page.fill('#search-complaints', '黄油');
        await page.waitForTimeout(100);
        const rows = await page.locator('#complaints-body tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('菜谱搜索功能', async ({ page }) => {
        await page.click('#tab-recipes');
        await page.fill('#search-recipes', '咖啡');
        await page.waitForTimeout(100);
        const rows = await page.locator('#recipes-body tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('顾客烦恼状态切换', async ({ page }) => {
        const firstButton = page.locator('#complaints-body tr:first-child button');
        const initialText = await firstButton.textContent();
        await firstButton.click();
        // Wait for API call to complete
        await page.waitForResponse(response => response.url().includes('toggle_complaint_complete'));
        await page.waitForTimeout(500);
        const newText = await firstButton.textContent();
        expect(newText.trim()).not.toBe(initialText.trim());
    });

    test('菜谱状态切换', async ({ page }) => {
        await page.click('#tab-recipes');
        const firstButton = page.locator('#recipes-body tr:first-child button');
        const initialText = await firstButton.textContent();
        await firstButton.click();
        // Wait for API call to complete
        await page.waitForResponse(response => response.url().includes('toggle_recipe_complete'));
        await page.waitForTimeout(500);
        const newText = await firstButton.textContent();
        expect(newText.trim()).not.toBe(initialText.trim());
    });

    test('条件列饮品链接跳转', async ({ page }) => {
        // 点击第一个顾客的条件列中的饮品链接
        const firstLink = page.locator('#complaints-body tr:first-child a').first();
        const linkText = await firstLink.textContent();

        await firstLink.click();
        await page.waitForTimeout(200);

        // 应该跳转到菜谱Tab
        await expect(page.locator('#panel-recipes')).toBeVisible();
        await expect(page.locator('#panel-complaints')).toBeHidden();

        // 搜索框应该填入了饮品名称
        await expect(page.locator('#search-recipes')).toHaveValue(linkText);

        // 应该显示回退按钮
        await expect(page.locator('#back-btn')).toBeVisible();
    });

    test('回退按钮功能', async ({ page }) => {
        // 先跳转
        const firstLink = page.locator('#complaints-body tr:first-child a').first();
        await firstLink.click();
        await page.waitForTimeout(200);

        // 点击回退
        await page.click('#back-btn');
        await page.waitForTimeout(200);

        // 应该回到顾客烦恼Tab
        await expect(page.locator('#panel-complaints')).toBeVisible();
        await expect(page.locator('#back-btn')).toBeHidden();
    });

    test('模糊搜索', async ({ page }) => {
        await page.fill('#search-complaints', '咖');
        await page.waitForTimeout(100);
        const rows = await page.locator('#complaints-body tr').count();
        // 应该匹配到包含"咖啡"的条件
        expect(rows).toBeGreaterThan(0);
    });
});
