# 开罗创意咖啡店攻略 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 MyTools 添加"开罗创意咖啡店攻略"工具，包含顾客烦恼和菜谱大全两个Tab，支持搜索、状态切换、跨Tab跳转

**Architecture:** Flask单页应用，Tab切换布局。数据首次从Excel读取并缓存为JSON，后续操作直接读写JSON文件。

**Tech Stack:** Flask, openpyxl, TailwindCSS, Vanilla JS

---

## 文件结构

```
backend/tools/kairo-cafe/
├── config.py          # 工具配置（name: kairo-cafe）
├── handler.py         # 数据加载、持久化、API
├── templates/
│   └── index.html     # 前端页面
└── data/              # JSON缓存目录（自动生成）
    ├── customer_complaints.json
    └── recipes.json
```

---

## Task 1: 创建目录结构和config.py

**Files:**
- Create: `backend/tools/kairo-cafe/config.py`
- Create: `backend/tools/kairo-cafe/templates/`
- Create: `backend/tools/kairo-cafe/data/`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p backend/tools/kairo-cafe/templates
mkdir -p backend/tools/kairo-cafe/data
```

- [ ] **Step 2: 创建 config.py**

```python
TOOL_CONFIG = {
    "name": "kairo-cafe",
    "display_name": "开罗创意咖啡店攻略",
    "description": "开罗游戏创意咖啡店攻略工具，包含顾客烦恼和菜谱大全",
    "template": "index.html",
    "icon": "☕"
}
```

---

## Task 2: 创建 handler.py

**Files:**
- Create: `backend/tools/kairo-cafe/handler.py`

**Excel数据路径:** `docs/开罗咖啡店工具/`

- [ ] **Step 1: 编写 handler.py**

```python
import os
import json
import openpyxl


def get_tool_data_path():
    """获取Excel源文件路径"""
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "..", "..", "docs", "开罗咖啡店工具"
    )


def get_cache_dir():
    """获取JSON缓存目录"""
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def load_or_create_customer_complaints():
    """加载顾客烦恼数据，首次从Excel读取并缓存为JSON"""
    cache_dir = get_cache_dir()
    cache_path = os.path.join(cache_dir, "customer_complaints.json")

    # 如果缓存存在，直接读取
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 从Excel读取
    data_path = get_tool_data_path()
    xlsx_path = os.path.join(data_path, "顾客烦恼攻略.xlsx")

    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb.active

    data = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue  # 跳过标题行
        if i == 1:
            continue  # 跳过表头行
        if row[0] is None:
            break
        item = {
            "序号": row[0],
            "顾客": row[1],
            "名称": row[2],
            "条件": row[3],
            "报酬": row[4],
            "是否已完成": False
        }
        data.append(item)

    # 保存缓存
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return data


def load_or_create_recipes():
    """加载菜谱大全数据，首次从Excel读取并缓存为JSON"""
    cache_dir = get_cache_dir()
    cache_path = os.path.join(cache_dir, "recipes.json")

    # 如果缓存存在，直接读取
    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # 从Excel读取
    data_path = get_tool_data_path()
    xlsx_path = os.path.join(data_path, "菜谱大全.xlsx")

    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb.active

    data = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue  # 跳过标题行
        if i == 1:
            continue  # 跳过表头行
        if row[0] is None:
            break
        item = {
            "序号": row[0],
            "饮品": row[1],
            "类别": row[2],
            "食材1": row[3],
            "食材2": row[4],
            "装饰物": row[5],
            "价格": row[6],
            "是否已完成": False
        }
        data.append(item)

    # 保存缓存
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return data


def save_customer_complaints(data):
    """保存顾客烦恼数据到JSON"""
    cache_dir = get_cache_dir()
    cache_path = os.path.join(cache_dir, "customer_complaints.json")
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def save_recipes(data):
    """保存菜谱数据到JSON"""
    cache_dir = get_cache_dir()
    cache_path = os.path.join(cache_dir, "recipes.json")
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


class Handler:
    def get_customer_complaints(self):
        """获取顾客烦恼列表"""
        data = load_or_create_customer_complaints()
        return {"status": "ok", "data": data}

    def get_recipes(self):
        """获取菜谱大全列表"""
        data = load_or_create_recipes()
        return {"status": "ok", "data": data}

    def toggle_complaint_complete(self, index=None):
        """切换顾客烦恼完成状态"""
        if index is None:
            return {"status": "error", "message": "缺少index参数"}

        data = load_or_create_customer_complaints()
        for item in data:
            if item["序号"] == index:
                item["是否已完成"] = not item["是否已完成"]
                save_customer_complaints(data)
                return {"status": "ok", "data": item}
        return {"status": "error", "message": "未找到对应记录"}

    def toggle_recipe_complete(self, index=None):
        """切换菜谱完成状态"""
        if index is None:
            return {"status": "error", "message": "缺少index参数"}

        data = load_or_create_recipes()
        for item in data:
            if item["序号"] == index:
                item["是否已完成"] = not item["是否已完成"]
                save_recipes(data)
                return {"status": "ok", "data": item}
        return {"status": "error", "message": "未找到对应记录"}
```

---

## Task 3: 创建前端页面 templates/index.html

**Files:**
- Create: `backend/tools/kairo-cafe/templates/index.html`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>开罗创意咖啡店攻略</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-4">
    <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 class="text-2xl font-bold mb-4">☕ 开罗创意咖啡店攻略</h1>

        <!-- Tab 按钮 -->
        <div class="flex border-b mb-4">
            <button id="tab-complaints" onclick="switchTab('complaints')"
                    class="tab-btn px-6 py-2 font-medium border-b-2 border-blue-500 text-blue-500">
                顾客烦恼
            </button>
            <button id="tab-recipes" onclick="switchTab('recipes')"
                    class="tab-btn px-6 py-2 font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                菜谱大全
            </button>
        </div>

        <!-- 回退按钮（隐藏） -->
        <button id="back-btn" onclick="goBack()"
                class="hidden mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
            ← 返回顾客烦恼
        </button>

        <!-- 顾客烦恼 Tab -->
        <div id="panel-complaints">
            <div class="mb-4">
                <input type="text" id="search-complaints" placeholder="搜索名称..."
                       oninput="filterComplaints()"
                       class="w-full md:w-1/3 px-4 py-2 border rounded-lg">
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">序号</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">顾客</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">名称</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">条件</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">报酬</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">操作</th>
                        </tr>
                    </thead>
                    <tbody id="complaints-body" class="bg-white divide-y divide-gray-200">
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 菜谱大全 Tab -->
        <div id="panel-recipes" class="hidden">
            <div class="mb-4">
                <input type="text" id="search-recipes" placeholder="搜索饮品..."
                       oninput="filterRecipes()"
                       class="w-full md:w-1/3 px-4 py-2 border rounded-lg">
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">序号</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">饮品</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">类别</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">食材1</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">食材2</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">装饰物</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">价格</th>
                            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">操作</th>
                        </tr>
                    </thead>
                    <tbody id="recipes-body" class="bg-white divide-y divide-gray-200">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const toolName = 'kairo-cafe';
        let complaintsData = [];
        let recipesData = [];
        let currentTab = 'complaints';
        let previousTab = null;
        let previousSearch = '';

        // 初始化
        async function init() {
            await loadComplaints();
            await loadRecipes();
        }

        async function loadComplaints() {
            const res = await fetch(`/api/tools/${toolName}/get_customer_complaints`);
            const data = await res.json();
            complaintsData = data.data || [];
            renderComplaints(complaintsData);
        }

        async function loadRecipes() {
            const res = await fetch(`/api/tools/${toolName}/get_recipes`);
            const data = await res.json();
            recipesData = data.data || [];
            renderRecipes(recipesData);
        }

        // Tab 切换
        function switchTab(tab) {
            previousTab = currentTab;
            previousSearch = document.getElementById('search-complaints').value;
            currentTab = tab;

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-500');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            document.getElementById(`tab-${tab}`).classList.remove('border-transparent', 'text-gray-500');
            document.getElementById(`tab-${tab}`).classList.add('border-blue-500', 'text-blue-500');

            document.getElementById('panel-complaints').classList.toggle('hidden', tab !== 'complaints');
            document.getElementById('panel-recipes').classList.toggle('hidden', tab !== 'recipes');
        }

        // 回退
        function goBack() {
            if (previousTab) {
                switchTab(previousTab);
                document.getElementById('search-complaints').value = previousSearch;
                filterComplaints();
            }
            document.getElementById('back-btn').classList.add('hidden');
        }

        // 渲染顾客烦恼
        function renderComplaints(data) {
            const tbody = document.getElementById('complaints-body');
            tbody.innerHTML = data.map(item => `
                <tr class="${item['是否已完成'] ? 'bg-green-50' : ''}">
                    <td class="px-4 py-2">${item['序号']}</td>
                    <td class="px-4 py-2">${item['顾客'] || ''}</td>
                    <td class="px-4 py-2">${item['名称'] || ''}</td>
                    <td class="px-4 py-2">${formatConditions(item['条件'])}</td>
                    <td class="px-4 py-2">${item['报酬'] || ''}</td>
                    <td class="px-4 py-2">
                        <button onclick="toggleComplaint(${item['序号']})"
                                class="px-3 py-1 rounded ${item['是否已完成'] ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}">
                            ${item['是否已完成'] ? '已完成' : '未完成'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // 格式化条件列 - 将饮品名称转换为链接
        function formatConditions(conditions) {
            if (!conditions) return '';
            // 匹配饮品名称（逗号分隔）
            const parts = conditions.split(/[,、]/);
            return parts.map(part => {
                const drink = part.trim();
                if (drink) {
                    return `<a href="#" onclick="jumpToRecipe('${drink}'); return false;"
                            class="text-blue-500 hover:underline mx-1">${drink}</a>`;
                }
                return part;
            }).join('');
        }

        // 跳转到菜谱并搜索
        function jumpToRecipe(drinkName) {
            previousSearch = document.getElementById('search-complaints').value;
            switchTab('recipes');
            document.getElementById('search-recipes').value = drinkName;
            document.getElementById('back-btn').classList.remove('hidden');
            filterRecipes();
        }

        // 渲染菜谱
        function renderRecipes(data) {
            const tbody = document.getElementById('recipes-body');
            tbody.innerHTML = data.map(item => `
                <tr class="${item['是否已完成'] ? 'bg-green-50' : ''}">
                    <td class="px-4 py-2">${item['序号']}</td>
                    <td class="px-4 py-2">${item['饮品'] || ''}</td>
                    <td class="px-4 py-2">${item['类别'] || ''}</td>
                    <td class="px-4 py-2">${item['食材1'] || ''}</td>
                    <td class="px-4 py-2">${item['食材2'] || ''}</td>
                    <td class="px-4 py-2">${item['装饰物'] || ''}</td>
                    <td class="px-4 py-2">${item['价格'] || ''}</td>
                    <td class="px-4 py-2">
                        <button onclick="toggleRecipe(${item['序号']})"
                                class="px-3 py-1 rounded ${item['是否已完成'] ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}">
                            ${item['是否已完成'] ? '已完成' : '未完成'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // 搜索过滤 - 顾客烦恼
        function filterComplaints() {
            const keyword = document.getElementById('search-complaints').value.toLowerCase();
            const filtered = complaintsData.filter(item =>
                (item['名称'] || '').toLowerCase().includes(keyword)
            );
            renderComplaints(filtered);
        }

        // 搜索过滤 - 菜谱
        function filterRecipes() {
            const keyword = document.getElementById('search-recipes').value.toLowerCase();
            const filtered = recipesData.filter(item =>
                (item['饮品'] || '').toLowerCase().includes(keyword)
            );
            renderRecipes(filtered);
        }

        // 切换顾客烦恼状态
        async function toggleComplaint(index) {
            const res = await fetch(`/api/tools/${toolName}/toggle_complaint_complete`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({index})
            });
            const data = await res.json();
            if (data.status === 'ok') {
                await loadComplaints();
            }
        }

        // 切换菜谱状态
        async function toggleRecipe(index) {
            const res = await fetch(`/api/tools/${toolName}/toggle_recipe_complete`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({index})
            });
            const data = await res.json();
            if (data.status === 'ok') {
                await loadRecipes();
            }
        }

        init();
    </script>
</body>
</html>
```

---

## Task 4: 删除旧工具目录

**Files:**
- Delete: `backend/tools/开罗创意咖啡店攻略/`

- [ ] **Step 1: 删除旧工具**

```bash
rm -rf backend/tools/开罗创意咖啡店攻略
```

---

## Task 5: 启动服务测试

- [ ] **Step 1: 启动服务**

```bash
cd backend && uv sync && uv run python run.py
```

- [ ] **Step 2: 访问 http://127.0.0.1:5003/tool/kairo-cafe**

确认页面加载正常，两个Tab可切换。

---

## Task 6: 编写 Playwright 测试

**Files:**
- Create: `tests/kairo-cafe.spec.js`

- [ ] **Step 1: 创建测试文件**

```javascript
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
        await page.waitForTimeout(200);
        const newText = await firstButton.textContent();
        expect(newText).not.toBe(initialText);
    });

    test('菜谱状态切换', async ({ page }) => {
        await page.click('#tab-recipes');
        const firstButton = page.locator('#recipes-body tr:first-child button');
        const initialText = await firstButton.textContent();
        await firstButton.click();
        await page.waitForTimeout(200);
        const newText = await firstButton.textContent();
        expect(newText).not.toBe(initialText);
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
        const originalSearch = await page.locator('#search-complaints').inputValue();
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
```

- [ ] **Step 2: 运行测试**

```bash
npx playwright test tests/kairo-cafe.spec.js --reporter=line
```

Expected: All tests pass

---

## 自检清单

- [ ] Spec覆盖：所有需求都已实现
- [ ] 无placeholder：所有代码完整
- [ ] 类型一致：index参数使用整数序号
- [ ] 目录名：`kairo-cafe`（英文）
- [ ] 页面显示：中文
