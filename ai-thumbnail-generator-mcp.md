# AI Thumbnail Generator - MCP 协议文档

## 项目概述

**AI Thumbnail Generator** 是一个面向海外创作者的AI驱动缩略图生成SaaS平台，支持YouTube、TikTok、Instagram、Blog等多平台，根据用户输入的标题和主题自动生成专业级缩略图。

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                     用户浏览器 Visitor                        │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼──────────┐
         │  Vercel Edge CDN  │  全球边缘加速
         └───────┬──────────┘
                 │
         ┌───────▼──────────────────┐
         │  Next.js 前端 (React)    │
         │  TailwindCSS 样式        │
         └───────┬──────────────────┘
                 │
         ┌───────▼────────────────────┐
         │  Next.js API Routes        │  无服务器后端
         └───────┬────────────────────┘
         ┌───────┼─────────────────────┐
         │       │                     │
    ┌────▼──┐┌──▼─────┐┌───────┐┌────▼────┐
    │OpenAI ││Cloudflare││Stripe││ Auth0   │
    │DALL·E3││  R2    ││ 支付  ││ 用户认证 │
    │ API   ││ 存储   ││订阅计费││         │
    └───────┘└────────┘└───────┘└─────────┘
                 │
         ┌───────▼────────────────────┐
         │  Supabase PostgreSQL        │  用户/订单/数据
         └─────────────────────────────┘
```

## 核心功能 MCP 工具定义

### 1. generate_thumbnail

生成缩略图工具。

**参数:**
```typescript
{
  title: string;          // 视频/文章标题
  platform: "youtube" | "tiktok" | "instagram" | "blog";  // 目标平台
  style?: string;         // 风格偏好 (可选) 例如："科技风"、"美食风"、"简约"
  count?: number;         // 生成数量，默认 1，最大 4
}
```

**返回:**
```typescript
{
  job_id: string;
  status: "pending" | "completed" | "failed";
  images: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
    prompt: string;
  }>;
  credits_remaining: number;
}
```

**尺寸规格:**
- YouTube: `1280 × 720` (16:9)
- TikTok: `1080 × 1920` (9:16)
- Instagram Post: `1080 × 1080` (1:1)
- Instagram Story: `1080 × 1920` (9:16)
- Blog: `1200 × 630`

---

### 2. list_user_images

列出用户生成的历史图片。

**参数:**
```typescript
{
  limit?: number;    // 分页大小，默认 20
  offset?: number;   // 偏移量，默认 0
}
```

**返回:**
```typescript
{
  images: Array<{
    id: string;
    title: string;
    platform: string;
    created_at: string;
    url: string;
    width: number;
    height: number;
  }>;
  total: number;
}
```

---

### 3. download_thumbnail

下载缩略图（指定尺寸）。

**参数:**
```typescript
{
  image_id: string;
  format?: "png" | "jpg";  // 默认 png
}
```

**返回:**
```typescript
{
  download_url: string;
  expires_at: string;
}
```

---

### 4. get_user_credits

查询用户剩余积分/配额。

**参数:**
```typescript
{}  // 不需要参数，从认证token获取用户
```

**返回:**
```typescript
{
  credits_remaining: number;
  subscription_plan: "free" | "pro" | "unlimited";
  subscription_expires_at?: string;
}
```

---

### 5. create_checkout_session

创建订阅支付会话。

**参数:**
```typescript
{
  plan_id: "monthly_pro" | "monthly_unlimited";
}
```

**返回:**
```typescript
{
  checkout_url: string;
}
```

---

## 定价方案

| 方案 | 价格 | 每月生成限额 | 功能 |
|------|------|-------------|------|
| Free | $0 | 5张 | 基础质量，有水印 |
| Pro | $9/month | 50张 | 高清无水印 |
| Unlimited | $19/month | 无限制 | 高清无水印 |

## 提示词工程模板

### YouTube 科技视频模板

```
Create a YouTube thumbnail for a video titled: "{title}".
The thumbnail should be eye-catching, high contrast, professional technology style.
Include dramatic composition, clear focal point. Aspect ratio 16:9.
Style: modern, clean, clickbait but high quality.
```

### TikTok 短视频模板

```
Create a vertical TikTok thumbnail for a video titled: "{title}".
Aspect ratio 9:16. The image should be bold, colorful, immediately grab attention
on mobile feeds. Style: {style}.
```

## 环境变量

```env
# OpenAI
OPENAI_API_KEY=sk-xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Auth0
AUTH0_DOMAIN=xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
AUTH0_AUDIENCE=https://api.xxx.com

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=thumbnails
R2_PUBLIC_DOMAIN=https://thumbnails.xxx.com
```

## 部署

一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/ai-thumbnail-generator)

## 目录结构

```
ai-thumbnail-generator/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── generate/      # 生成缩略图
│   │   ├── images/        # 图片列表
│   │   ├── download/      # 下载
│   │   ├── checkout/      # 支付
│   │   └── webhook/       # Stripe webhook
│   ├── dashboard/         # 用户面板
│   ├── generate/          # 生成页面
│   └── pricing/           # 定价页面
├── components/            # React 组件
├── lib/                   # 工具库
│   ├── openai.ts         # OpenAI 封装
│   ├── storage.ts         # R2 存储封装
│   ├── stripe.ts         # Stripe 封装
│   └── supabase.ts       # Supabase 封装
├── public/                # 静态资源
└── package.json
```

## 错误码

| 代码 | 说明 |
|------|------|
| `insufficient_credits` | 积分不足 |
| `unauthorized` | 未授权 |
| `openai_error` | OpenAI API 错误 |
| `storage_error` | 存储错误 |
| `invalid_parameter` | 参数错误 |

## 更新日志

- **v1.0.0** - 初始版本，支持基础缩略图生成
