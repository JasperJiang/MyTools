import os
import importlib


def create_app():
    from flask import Flask, jsonify, render_template, send_from_directory, request
    from app.config import Config

    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(base_dir))

    app = Flask(__name__)
    app.config.from_object(Config)

    # 路径配置
    app.template_folder = os.path.join(root_dir, "frontend", "src")
    app.static_folder = os.path.join(root_dir, "frontend", "src")
    app.static_url_path = ""
    tools_dir = os.path.join(root_dir, "backend", "tools")

    # 主页
    @app.route("/")
    def index():
        tools = get_registered_tools()
        return render_template("index.html", tools=tools)

    # 工具列表 API
    @app.route("/api/tools")
    def get_tools():
        tools = get_registered_tools()
        return jsonify({"tools": tools})

    # 工具静态文件
    @app.route("/tools/<tool_name>/<path:filename>")
    def tool_static(tool_name, filename):
        tool_path = os.path.join(tools_dir, tool_name)
        return send_from_directory(tool_path, filename)

    # 工具页面
    @app.route("/tool/<tool_name>")
    def tool_page(tool_name):
        tool_config = get_tool_config(tool_name)
        if not tool_config:
            return "Tool not found", 404
        template_path = tool_config.get("template", "index.html")
        full_template_path = os.path.join(tools_dir, tool_name, "templates", template_path)
        return send_from_directory(os.path.dirname(full_template_path), os.path.basename(full_template_path))

    # 工具 API
    @app.route("/api/tools/<tool_name>/<action>", methods=["POST"])
    def tool_api(tool_name, action):
        tool_config = get_tool_config(tool_name)
        if not tool_config:
            return jsonify({"error": "Tool not found"}), 404

        handler_module = importlib.import_module(f"tools.{tool_name}.handler")
        handler = getattr(handler_module, "Handler")()

        if not hasattr(handler, action):
            return jsonify({"error": "Action not found"}), 404

        # 解析请求体
        data = request.get_json() or {}
        result = getattr(handler, action)(**data)
        return jsonify(result)

    return app


def get_registered_tools():
    tools_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools")
    tools = []

    for name in os.listdir(tools_dir):
        tool_path = os.path.join(tools_dir, name)
        if os.path.isdir(tool_path) and not name.startswith("_"):
            config = get_tool_config(name)
            if config:
                tools.append(config)

    return tools


def get_tool_config(tool_name):
    try:
        config_module = importlib.import_module(f"tools.{tool_name}.config")
        return config_module.TOOL_CONFIG
    except (ImportError, AttributeError):
        return {
            "name": tool_name,
            "display_name": tool_name.replace("_", " ").title(),
            "description": "A tool",
            "template": "index.html",
            "icon": "🛠️"
        }
