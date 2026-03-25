# 阿里千文图片生成 API 集成指南

## 概述

本项目已集成阿里千文（DashScope）图片生成 API，支持通过文本提示词生成高质量图片。

## 配置步骤

### 1. 获取 API Key

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 进入 "API-KEY 管理" 页面
4. 创建新的 API Key 并保存

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置以下变量：

```bash
# 阿里千文图片生成 API 配置
ALI_IMAGE_GEN_API_KEY=your-ali-image-gen-api-key
ALI_IMAGE_GEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis
ALI_IMAGE_GEN_MODEL=wanx-v1
ALI_IMAGE_GEN_TIMEOUT=30000
```

### 3. 数据库迁移

执行数据库迁移脚本，添加必要的表和字段：

```bash
mysql -u your_username -p generate_img < database/migration_add_ali_image_gen.sql
```

或者在 MySQL 客户端中手动执行 `database/migration_add_ali_image_gen.sql` 文件中的 SQL 语句。

## API 使用说明

### 1. 生成图片

**接口：** `POST /api/ali-image-gen/generate`

**请求参数：**
```json
{
  "prompt": "一只可爱的橘猫在花园里玩耍",
  "negativePrompt": "模糊, 低质量, 变形",
  "size": "1024*1024",
  "n": 1,
  "seed": 12345
}
```

**参数说明：**
- `prompt` (必填): 图片生成提示词，描述你想要生成的图片内容
- `negativePrompt` (可选): 负面提示词，描述你不想要在图片中出现的内容
- `size` (可选): 图片尺寸，支持 "1024*1024"、"768*1024"、"1024*768" 等
- `n` (可选): 生成图片数量，默认为 1
- `seed` (可选): 随机种子，用于复现生成结果

**响应示例：**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "taskId": "ali-task-12345",
  "status": "completed",
  "imageUrl": "/api/images/550e8400-e29b-41d4-a716-446655440000.png",
  "results": [
    {
      "url": "https://dashscope-result.oss-cn-zhangjiakou.aliyuncs.com/..."
    }
  ],
  "message": "Image generated successfully"
}
```

### 2. 查询任务状态

对于异步任务，可以通过此接口查询生成状态。

**接口：** `GET /api/ali-image-gen/status/:jobId`

**路径参数：**
- `jobId`: 生成任务的 ID

**响应示例：**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "aliStatus": "PENDING",
  "message": "Task is still processing"
}
```

## 数据库表结构

### jobs 表扩展字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| task_type | TINYINT | 任务类型：1-mermaid图表，2-阿里千文图片生成 |
| prompt | TEXT | 图片生成提示词 |
| negative_prompt | TEXT | 负面提示词 |
| image_size | VARCHAR(20) | 图片尺寸 |
| image_count | INT | 生成图片数量 |
| seed | INT | 随机种子 |
| ali_task_id | VARCHAR(100) | 阿里千文任务 ID |

### ali_image_gen_tasks 表

阿里千文生成任务详情表，用于存储更详细的任务信息。

## 使用示例

### 使用 curl 测试

```bash
# 生成图片
curl -X POST http://localhost:3000/api/ali-image-gen/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的橘猫在花园里玩耍，阳光明媚",
    "size": "1024*1024"
  }'

# 查询任务状态
curl http://localhost:3000/api/ali-image-gen/status/your-job-id
```

### 使用 JavaScript fetch

```javascript
// 生成图片
async function generateImage(prompt) {
  const response = await fetch('http://localhost:3000/api/ali-image-gen/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      size: '1024*1024'
    })
  });
  
  const data = await response.json();
  return data;
}

// 查询任务状态
async function checkStatus(jobId) {
  const response = await fetch(`http://localhost:3000/api/ali-image-gen/status/${jobId}`);
  const data = await response.json();
  return data;
}
```

## 注意事项

1. **API 配额：** 请关注阿里云百炼平台的 API 调用配额和费用
2. **生成时间：** 图片生成可能需要几秒钟到几分钟不等，请耐心等待
3. **任务状态：** 对于长时间运行的任务，建议使用轮询方式查询状态
4. **图片保存：** 生成的图片会同时保存在本地和阿里云端
5. **错误处理：** 请妥善处理 API 调用可能出现的错误

## 故障排除

### API Key 未配置

错误信息：`阿里千文图片生成服务未配置`

解决方法：确保在 `.env` 文件中正确配置了 `ALI_IMAGE_GEN_API_KEY`

### 数据库表不存在

错误信息：`Table 'generate_img.ali_image_gen_tasks' doesn't exist`

解决方法：执行数据库迁移脚本 `database/migration_add_ali_image_gen.sql`

### API 调用超时

错误信息：`阿里千文 API 请求超时`

解决方法：增加 `ALI_IMAGE_GEN_TIMEOUT` 的值，或检查网络连接

## 更多信息

- [阿里千文官方文档](https://help.aliyun.com/zh/dashscope/)
- [API 参考文档](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
