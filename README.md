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
npm start
```

浏览器访问 `http://localhost:3000`。

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

## 项目结构

```
├── server.js              # Express 服务入口
├── src/
│   ├── config.js          # 配置（端口、目录、基础路径）
│   └── fileService.js     # 文件扫描 + 安全校验
├── public/
│   ├── index.html         # 前端页面
│   ├── css/style.css      # 样式（Animal Island 主题）
│   └── js/
│       ├── app.js         # 主逻辑 + 路由
│       ├── tree.js        # 文件树组件
│       └── viewer.js      # Markdown 渲染
└── docs/                  # 默认 Markdown 文件目录
```
