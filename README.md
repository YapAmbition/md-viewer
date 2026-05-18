# Markdown Viewer

一个简洁的 Markdown 文件浏览 Web 应用，将指定目录下的 Markdown 文件以网页形式展示，支持多层目录浏览。UI 风格基于 Animal Island。

## 功能

- 多层目录文件树导航，支持折叠/展开
- GitHub 风格 Markdown 渲染，支持代码语法高亮
- 按文件名或修改时间排序（升序/降序切换）
- 文件名搜索过滤
- 侧边栏可收起
- 文件上传（需密码验证，支持指定子目录）
- 文件删除（软删除，移动到配置的回收目录）
- 移动端响应式布局
- URL hash 深度链接
- 支持 nginx 子路径反向代理部署

## 快速开始

```bash
npm install

# 开发模式（同时启动前端热更新和后端服务，一个命令即可）
npm run dev

# 生产模式（先构建前端，再启动服务）
npm run build
npm start
```

开发模式下浏览器访问 `http://localhost:5173`（Vite 热更新），生产模式访问 `http://localhost:4000`（或配置的端口）。

## 配置

通过环境变量或 `.env` 文件配置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MARKDOWN_DIR` | `./docs` | Markdown 文件目录路径（支持绝对路径和相对路径） |
| `PORT` | `3000` | 服务端口 |
| `BASE_PATH` | `/` | URL 基础路径，用于 nginx 子路径代理部署 |
| `UPLOAD_PASSWORD` | _(空)_ | 上传和删除操作的密码，不设置则禁止上传和删除 |
| `TRASH_DIR` | `./trash` | 软删除文件的存放目录 |

`.env` 文件示例：

```
MARKDOWN_DIR=/home/user/my-notes
PORT=4000
BASE_PATH=/
UPLOAD_PASSWORD=my_secret_password
TRASH_DIR=/home/user/md-trash
```

也可以通过命令行直接传入：

```bash
MARKDOWN_DIR=/path/to/notes PORT=8080 npm start
```

## Nginx 反向代理部署

如果需要通过 `http://your-server/md-view/` 访问：

1. 在 `.env` 中设置 `BASE_PATH=/md-view/`

2. 在 nginx 配置中添加：

```nginx
location /md-view/ {
    proxy_pass http://127.0.0.1:4000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

注意：`proxy_pass` 末尾的 `/` 是必须的，nginx 会自动剥离 `/md-view/` 前缀再转发给应用。

3. 重载 nginx：

```bash
sudo nginx -s reload
```

## PM2 进程管理

生产环境推荐使用 PM2 管理服务：

```bash
# 1. 先构建前端
npm run build

# 2. 启动服务
pm2 start server.js --name md-viewer

# 常用命令
pm2 status              # 查看状态
pm2 logs md-viewer      # 查看日志
pm2 restart md-viewer   # 重启服务
pm2 stop md-viewer      # 停止服务
pm2 delete md-viewer    # 删除进程
```

更新代码后重新部署：

```bash
git pull
npm install
npm run build
pm2 restart md-viewer
```

## 项目结构

```
├── server.js              # Express 服务入口（生产模式提供 API + 静态文件）
├── src/
│   ├── config.js          # 配置（端口、目录、基础路径）
│   └── fileService.js     # 文件扫描 + 安全校验
├── frontend/              # React 前端项目（Vite + React）
│   ├── src/
│   │   ├── main.jsx       # 入口文件
│   │   ├── App.jsx        # 根组件
│   │   ├── index.css      # 样式（Animal Island 主题）
│   │   ├── api.js         # API 调用封装
│   │   └── components/    # React 组件
│   │       ├── Topbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── FileTree.jsx
│   │       ├── MarkdownViewer.jsx
│   │       ├── UploadModal.jsx
│   │       └── DeleteModal.jsx
│   ├── vite.config.js     # Vite 配置（API 代理 + 构建输出）
│   └── index.html
├── dist/                  # 生产构建输出（npm run build 后生成）
└── docs/                  # 默认 Markdown 文件目录
```
