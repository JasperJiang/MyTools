# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MyTools is a tools aggregator web application. Each tool is isolated in its own directory under `backend/tools/<tool_name>/` with self-contained logic, templates, and configuration.

## Commands

```bash
# 本地开发
cd backend && uv sync && uv run python run.py
# 访问 http://127.0.0.1:5003

# Docker 部署
docker build -t jasperjiang/mytools --platform linux/amd64 .
docker run -d -p 5003:5003 -v $(pwd)/db:/app/db --name mytools jasperjiang/mytools
```

## Architecture

**Flask App Factory**: `backend/app/__init__.py` - `create_app()` registers routes dynamically based on discovered tools.

**Tool Discovery**: Tools in `backend/tools/` are auto-discovered by scanning directories. Each tool must have:
- `config.py` - exports `TOOL_CONFIG` dict
- `handler.py` - exports `Handler` class with action methods
- `templates/` - HTML templates for the tool

**Path Resolution**: Uses `__file__` to compute paths (two levels up from `app/__init__.py` to reach project root), so Flask can find `frontend/src` for templates and `backend/tools` for tool modules.

**Tool API Pattern**: `POST /api/tools/<tool_name>/<action>` dynamically calls `Handler.<action>()` method.

## Adding a Tool

1. Create `backend/tools/<tool_name>/`
2. Add `config.py` with `TOOL_CONFIG`
3. Add `handler.py` with `Handler` class
4. Add `templates/index.html`
5. Tool appears automatically on homepage

## Tool Template Requirements

每个工具页面必须包含"返回首页"按钮，样式如下：

```html
<a href="/" class="inline-flex items-center gap-1 mb-4 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-700">
    ← 返回首页
</a>
```

此按钮应放在 `<body>` 的主要内容容器之前。
