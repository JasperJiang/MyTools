# Project Summary

## 版本历史

### 9. 开罗创意咖啡店攻略工具 (2026-04-15)

新增 `kairo-cafe` 工具，为 MyTools 添加开罗游戏创意咖啡店攻略功能。

**功能：**
- 顾客烦恼 Tab：展示顾客烦恼列表，支持搜索、状态切换
- 菜谱大全 Tab：展示菜谱列表，支持搜索、状态切换
- 跨 Tab 跳转：点击条件列中的饮品名称，自动跳转到菜谱 Tab 并搜索
- 回退按钮：支持返回原 Tab 和搜索状态
- 状态持久化：JSON 文件存储在 `db/tools/kairo-cafe/` 目录

**文件变更：**
- 新增 `backend/tools/kairo-cafe/` - 工具目录
- 新增 `db/tools/kairo-cafe/` - JSON 数据目录
- 新增 `tests/kairo-cafe.spec.js` - Playwright 测试
- 新增 `Dockerfile` - 根目录的 Dockerfile
- 更新 `backend/app/__init__.py` - 修复工具页面模板路径和 API 请求体传递

**技术细节：**
- 数据首次从 Excel 读取并缓存为 JSON
- 后续直接读写 JSON 文件
- API Pattern: `POST /api/tools/kairo-cafe/<action>`

**API 接口：**
| 接口 | 方法 | 说明 |
|------|------|------|
| `get_customer_complaints` | POST | 获取顾客烦恼列表 |
| `get_recipes` | POST | 获取菜谱大全列表 |
| `toggle_complaint_complete` | POST | 切换顾客烦恼状态 |
| `toggle_recipe_complete` | POST | 切换菜谱状态 |

**测试：** 10/10 Playwright 测试通过

### 10. Docker 部署优化与 kairo-cafe Bug 修复 (2026-04-15)

**Dockerfile 优化：**
- 改用 `uv sync --frozen` 管理 Python 依赖（替代 pip install）
- CMD 改为使用 `.venv/bin/gunicorn`

**Bug 修复：**
- 前端链接修复：`/tools/${tool.name}` → `/tool/${tool.name}`（与后端路由匹配）
- kairo-cafe 条件列链接逻辑：只有以"选："开头的条件才将饮品名转换为可跳转链接

### 11. kairo-cafe 移动端响应式修复 (2026-04-15)

**问题：** 手机端表格被挤压成一列，无法正常显示。

**修复：**
- 移除 `w-full`，改用固定 `width: 800px`
- 表格容器使用 `overflow-x: auto` 实现水平滚动
- 手机端添加边框使滚动区域更明显

### 12. 工具页面添加返回首页按钮 (2026-04-15)

为所有工具页面添加"← 返回首页"按钮，方便用户返回主页。

### 13. 删除 example_tool (2026-04-15)

移除示例工具 `example_tool`，保留真正有用的 kairo-cafe 工具。
