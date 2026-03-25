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
  "images": [
    {
      "filename": "a1b2c3d4.png",
      "jobId": "a1b2c3d4",
      "url": "/api/images/a1b2c3d4.png",
      "size": 12345,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
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

通过环境变量配置端口：
```bash
PORT=8080 npm start
```

## 目录结构

```
generate-img/
├── server.js          # API 服务主文件
├── generate.js        # 原有命令行生成脚本
├── API.md             # 本文档
├── output/            # 生成的图片输出目录（自动创建）
├── tmp/               # 临时文件目录（自动创建）
└── package.json
```
