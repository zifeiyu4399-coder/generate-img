# Generate-img

基于 mermaid-cli 的 mermaid 图表生成 PNG 图片的 REST API 服务，支持 MySQL 数据库持久化和 Redis 缓存。

## 功能特性

- 🎨 从 mermaid 文本或 .mmd 文件生成 PNG 图片
- 💾 MySQL 数据库支持，持久化任务记录
- ⚡ Redis 缓存支持，提升查询性能
- 🔄 任务状态跟踪（pending/processing/completed/failed）
- 📋 RESTful API 接口
- 🛡️ 向后兼容，无数据库/缓存也能正常运行

## 安装

```bash
npm install
```

## CLI 使用

```bash
npm run generate
```

### CLI 配置

- `input`: `architecture.mmd` - mermaid 图表文件
- `output`: `architecture.png` - 输出 PNG 图片

## REST API 服务

### 基础使用（无需数据库）

```bash
# 启动服务
npm start

# 开发模式（自动重启）
npm run dev
```

服务默认运行在 `http://localhost:3000`，通过环境变量设置端口：

```bash
PORT=8080 npm start
```

### 完整功能（带 MySQL 和 Redis）

#### 1. 初始化数据库

```bash
mysql -u root -p < database/init.sql
```

#### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
# 编辑 .env 文件
```

#### 3. 启动服务

```bash
npm start
```

## API 接口

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | 从 mermaid 文本生成图片 |
| POST | `/api/generate/upload` | 上传 .mmd 文件生成图片 |
| GET | `/api/images/:filename` | 获取生成的图片 |
| DELETE | `/api/images/:filename` | 删除生成的图片 |
| GET | `/api/list` | 列出所有生成的图片 |
| GET | `/api/jobs/:jobId` | 获取任务详情 |
| GET | `/api/health` | 健康检查 |

详细文档请参考 [API.md](./API.md)

## 使用示例

### 使用 curl 从内容生成

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mermaidContent": "graph LR\nA[开始] --> B[结束]"}'
```

## 配置说明

参考 [API.md](./API.md) 获取完整的 API 文档和配置说明。

## 目录结构

```
generate-img/
├── server.js          # API 服务主文件
├── generate.js        # 命令行生成脚本
├── config.js          # 配置文件
├── db.js              # 数据库操作模块
├── cache.js           # 缓存操作模块
├── API.md             # API 文档
├── README.md          # 本文件
├── database/
│   └── init.sql       # 数据库初始化脚本
├── output/            # 生成的图片输出目录
├── tmp/               # 临时文件目录
└── package.json
```

## 许可证

MIT
