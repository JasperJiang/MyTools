# MyTools

工具集合 Web 应用

## 技术栈

- **后端**: Python 3.x + Flask (uv 管理)
- **前端**: Tailwind CSS v3 (CDN) + Vanilla JS
- **容器化**: Docker

## 快速开始

### 本地开发

```bash
cd backend
uv sync
uv run python run.py
```

访问 http://127.0.0.1:5003

### Docker 部署

```bash
docker build -t jasperjiang/mytools --platform linux/amd64 .
docker run -d -p 5003:5003 -v $(pwd)/db:/app/db --name mytools jasperjiang/mytools
```

**注意：** `db/` 目录需要预先准备好，包含 `tools/<tool_name>/` 子目录结构。

## 项目结构

```
MyTools/
├── .claude/             # Claude Code skills
│   └── skills/
├── .gitignore
├── Dockerfile           # 根目录 Dockerfile
├── README.md
├── CLAUDE.md
├── backend/             # Flask 后端
│   ├── app/            # 应用核心
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── routes/
│   │   └── utils/
│   ├── tools/          # 工具目录（每个工具独立隔离）
│   │   └── kairo-cafe/ # 开罗咖啡店攻略工具
│   │       ├── config.py
│   │       ├── handler.py
│   │       └── templates/
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── run.py
│   └── uv.lock
├── frontend/           # 前端静态文件
│   ├── src/
│   │   ├── css/
│   │   └── index.html
│   ├── package.json
│   └── tailwind.config.js
├── db/                 # 数据目录（工具JSON，由Docker挂载）
│   └── tools/
│       └── kairo-cafe/
│           ├── customer_complaints.json
│           └── recipes.json
├── docs/               # 项目文档
│   ├── PROJECT_SUMMARY.md
│   ├── superpowers/
│   └── 开罗咖啡店工具/
├── tests/              # Playwright 测试
└── package.json
```

## 添加新工具

1. 在 `backend/tools/` 下创建工具文件夹
2. 创建 `config.py` 定义工具配置
3. 创建 `handler.py` 定义处理逻辑
4. 创建 `templates/index.html` 定义页面

示例：`backend/tools/kairo-cafe/`

## 工具配置说明

```python
TOOL_CONFIG = {
    "name": "tool_name",           # 工具唯一标识
    "display_name": "显示名称",      # 页面显示名称
    "description": "描述",          # 工具描述
    "template": "index.html",       # 模板文件
    "icon": "🛠️"                   # 图标
}
```

## 工具 API

```bash
# 获取工具列表
GET /api/tools

# 工具操作
POST /api/tools/{tool_name}/{action}
```
