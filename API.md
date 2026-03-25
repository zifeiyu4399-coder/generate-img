# Generate-img API 文档

基于 mermaid-cli 的 mermaid 图表生成 PNG 图片的 REST API 服务。

## 启动服务

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（自动重启）
npm run dev
```

服务默认运行在 `http://localhost:3000`

## 接口列表

### 1. 健康检查

```
GET /api/health
```

**响应示例：**
```json
{
  "status": "ok",
  "service": "generate-img",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 从 mermaid 文本内容生成图片

```
POST /api/generate
Content-Type: application/json
```

**请求体：**
```json
{
  "mermaidContent": "graph LR\nA[开始] --> B[结束]"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| mermaidContent | String | 是 | mermaid 图表文本内容 |

**成功响应示例：**
```json
{
  "success": true,
  "jobId": "a1b2c3d4-...",
  "imageUrl": "/api/images/a1b2c3d4-....png",
  "message": "Image generated successfully"
}
```

**错误响应示例：**
```json
{
  "success": false,
  "error": "mermaidContent is required and must be a string"
}
```

### 3. 上传 .mmd 文件生成图片

```
POST /api/generate/upload
Content-Type: multipart/form-data
```

**表单参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | `.mmd` 或 `.mermaid` 格式的 mermaid 文件 |

**成功响应示例：**
```json
{
  "success": true,
  "jobId": "a1b2c3d4-...",
  "imageUrl": "/api/images/a1b2c3d4-....png",
  "originalFilename": "architecture.mmd",
  "message": "Image generated successfully"
}
```

### 4. 获取生成的图片

```
GET /api/images/{filename}
```

**路径参数：**
| 参数 | 说明 |
|------|------|
| filename | 图片文件名，由生成接口返回 |

**响应：**
- 成功：直接返回 PNG 图片文件
- 失败：`404 Not Found`

### 5. 删除生成的图片

```
DELETE /api/images/{filename}
```

**路径参数：**
| 参数 | 说明 |
|------|------|
| filename | 图片文件名 |

**成功响应示例：**
```json
{
  "success": true,
  "message": "Image xxx.png deleted successfully"
}
```

### 6. 列出所有生成的图片

```
GET /api/list
```

**成功响应示例：**
```json
{
  "success": true,
  "count": 2,
  "source": "database",
  "images": [
    {
      "filename": "a1b2c3d4.png",
      "jobId": "a1b2c3d4",
      "url": "/api/images/a1b2c3d4.png",
      "status": "completed",
      "originalFilename": "architecture.mmd",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 7. 获取任务详情

```
GET /api/jobs/{jobId}
```

**路径参数：**
| 参数 | 说明 |
|------|------|
| jobId | 任务ID |

**成功响应示例：**
```json
{
  "success": true,
  "job": {
    "id": "a1b2c3d4-...",
    "mermaid_content": "graph LR\nA[开始] --> B[结束]",
    "original_filename": null,
    "image_path": "/path/to/output/a1b2c3d4.png",
    "image_url": "/api/images/a1b2c3d4.png",
    "status": "completed",
    "error_message": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 使用示例

### curl 示例

**1. 直接生成：**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mermaidContent": "graph LR\nA[客户] --> B[系统]"}'
```

**2. 上传文件生成：**
```bash
curl -X POST http://localhost:3000/api/generate/upload \
  -F "file=@architecture.mmd"
```

### Node.js 示例

```javascript
const axios = require('axios');
const fs = require('fs');

// 方式一：直接传文本生成
async function generateFromText(content) {
  const response = await axios.post('http://localhost:3000/api/generate', {
    mermaidContent: content
  });
  return response.data;
}

// 方式二：上传文件生成
async function generateFromFile(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  const response = await axios.post('http://localhost:3000/api/generate/upload', formData, {
    headers: formData.getHeaders()
  });
  return response.data;
}
```

## 配置

### 基础配置

通过环境变量配置端口：
```bash
PORT=8080 npm start
```

### 数据库和缓存配置

项目支持 MySQL 数据库和 Redis 缓存，通过以下环境变量配置：

```bash
# MySQL 配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=generate_img

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### 数据库初始化

使用提供的 SQL 脚本初始化数据库：

```bash
mysql -u root -p < database/init.sql
```

## 目录结构

```
generate-img/
├── server.js          # API 服务主文件
├── generate.js        # 原有命令行生成脚本
├── config.js          # 配置文件
├── db.js              # 数据库操作模块
├── cache.js           # 缓存操作模块
├── API.md             # 本文档
├── database/
│   └── init.sql       # 数据库初始化脚本
├── output/            # 生成的图片输出目录（自动创建）
├── tmp/               # 临时文件目录（自动创建）
└── package.json
```

## 特性说明

### MySQL 数据库支持
- 任务记录持久化存储
- 任务状态跟踪（pending/processing/completed/failed）
- 支持错误信息记录
- 任务历史查询

### Redis 缓存支持
- 任务详情缓存，减少数据库查询
- 任务列表缓存，提升列表查询性能
- 可配置的缓存过期时间
- 自动缓存失效机制

### 向后兼容
- 如果 MySQL/Redis 不可用，服务仍可正常运行
- 原有 API 接口保持不变
- 新增接口可选使用
