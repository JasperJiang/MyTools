---
name: mytools-docker-deploy
description: Use to rebuild and redeploy mytools Docker container - includes build, cleanup, and volume mounting
---

# mytools Docker 部署

## 用途

重新构建并部署 mytools Docker 环境。

## 使用场景

- 代码更新后需要重新部署
- 镜像需要重建
- 容器需要重启

## 执行步骤

### 1. 清理旧容器和镜像

```bash
# 停止并删除运行中的容器
docker rm -f mytools

# 删除旧镜像（可选，如果需要完全重建）
docker rmi jasperjiang/mytools
```

### 2. 构建新镜像

```bash
docker build -t jasperjiang/mytools --platform linux/amd64 .
```

### 3. 运行容器（挂载 db 卷）

```bash
docker run -d -p 5003:5003 -v $(pwd)/db:/app/db --name mytools jasperjiang/mytools
```

## 完整命令序列

```bash
docker rm -f mytools 2>/dev/null
docker rmi jasperjiang/mytools 2>/dev/null
docker build -t jasperjiang/mytools --platform linux/amd64 .
docker run -d -p 5003:5003 -v $(pwd)/db:/app/db --name mytools jasperjiang/mytools
sleep 5
```

## 验证

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5003/
# 期望输出: 200
```

## 注意事项

- db 卷必须挂载以持久化工具数据（kairo-cafe 等工具的 JSON 数据）
- 端口 5003 必须可用
- 镜像构建使用 uv sync --frozen 安装依赖
- 多平台构建需要 Docker BuildKit (buildx)
- 推送多平台镜像前需先登录 Docker Hub
