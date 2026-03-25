# Google Auth & PayPal 集成指南

本文档详细说明了如何在 generate-img 项目中接入 Google OAuth 2.0 认证和 PayPal 支付功能。

---

## 📋 目录

1. [项目预留架构概览](#项目预留架构概览)
2. [Google OAuth 2.0 集成](#google-oauth-20-集成)
3. [PayPal 支付集成](#paypal-支付集成)
4. [数据库表说明](#数据库表说明)
5. [API 接口说明](#api-接口说明)

---

## 项目预留架构概览

当前项目已为 Google Auth 和 PayPal 预留了完整的架构：

### 新增的文件和目录

```
generate-img/
├── lib/
│   ├── auth.js          # 认证工具模块（Google OAuth, JWT）
│   └── payment.js       # 支付工具模块（PayPal）
├── middleware/
│   └── auth.js          # 认证中间件
├── routes/
│   ├── auth.js          # 认证路由
│   └── payment.js       # 支付路由
├── database/
│   └── init.sql         # 数据库初始化脚本（含新表）
├── config.js            # 配置文件（已更新）
├── .env.example         # 环境变量示例（已更新）
├── db.js                # 数据库操作（已更新）
├── server.js            # 主服务（已预留集成点）
└── INTEGRATION_GUIDE.md # 本文档
```

---

## Google OAuth 2.0 集成

### 步骤 1：安装依赖包

```bash
npm install google-auth-library jsonwebtoken express-session
# 或使用 passport 方案
npm install passport passport-google-oauth20 express-session jsonwebtoken
```

### 步骤 2：配置环境变量

在 `.env` 文件中填写：

```env
# Google OAuth 配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://your-domain.com/api/auth/google/callback

# JWT 配置
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=24h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Session 配置
SESSION_SECRET=your-session-secret-key-change-this-in-production
```

### 步骤 3：获取 Google 凭证

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 进入 "APIs & Services" → "Credentials"
4. 点击 "Create Credentials" → "OAuth client ID"
5. 选择应用类型："Web application"
6. 配置：
   - Name: Generate Image App
   - Authorized JavaScript origins: `http://your-domain.com`
   - Authorized redirect URIs: `http://your-domain.com/api/auth/google/callback`
7. 获取 Client ID 和 Client Secret

### 步骤 4：实现认证逻辑

编辑 `lib/auth.js`，取消注释并实现相关函数：

```javascript
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

// 在 googleAuth 对象中实现
const client = new OAuth2Client(config.google.clientId, config.google.clientSecret, config.google.callbackURL);

export const googleAuth = {
  getTokenFromCode: async (code) => {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    return tokens;
  },
  
  verifyIdToken: async (idToken) => {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId
    });
    return ticket.getPayload();
  }
};

// 实现 JWT
export const jwt = {
  signAccessToken: (payload) => jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTokenExpiresIn }),
  verify: (token) => jwt.verify(token, config.jwt.secret)
};
```

### 步骤 5：启用路由

在 `server.js` 中取消注释：

```javascript
app.use('/api/auth', authRoutes);
```

---

## PayPal 支付集成

### 步骤 1：安装依赖包

```bash
npm install @paypal/checkout-server-sdk
# 或使用旧版 SDK
npm install paypal-rest-sdk
```

### 步骤 2：配置环境变量

在 `.env` 文件中填写：

```env
# PayPal 配置
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # 上线时改为 live
PAYPAL_WEBHOOK_ID=your-paypal-webhook-id
PAYPAL_RETURN_URL=http://your-domain.com/api/payment/paypal/success
PAYPAL_CANCEL_URL=http://your-domain.com/api/payment/paypal/cancel
```

### 步骤 3：获取 PayPal 凭证

1. 访问 [PayPal Developer](https://developer.paypal.com/)
2. 登录并进入 "Dashboard" → "My Apps & Credentials"
3. 选择 "Sandbox" 或 "Live"
4. 点击 "Create App"
5. 填写应用名称：Generate Image Payments
6. 获取 Client ID 和 Secret

### 步骤 4：配置 Webhook（推荐）

1. 在 PayPal Developer 中进入你的应用
2. 点击 "Add Webhook"
3. Webhook URL: `https://your-domain.com/api/payment/paypal/webhook`
4. 选择事件类型：
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.DENIED`
5. 获取 Webhook ID

### 步骤 5：实现支付逻辑

编辑 `lib/payment.js`，使用 PayPal SDK：

```javascript
import { PayPalHttpClient, SandboxEnvironment, LiveEnvironment, orders, payments } from '@paypal/checkout-server-sdk';

function environment() {
  const clientId = config.paypal.clientId;
  const clientSecret = config.paypal.clientSecret;
  return config.paypal.mode === 'live' 
    ? new LiveEnvironment(clientId, clientSecret) 
    : new SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new PayPalHttpClient(environment());
}

export const paypal = {
  createOrder: async (amount, currency = 'USD', options = {}) => {
    const request = new orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: options.description || 'Generate Image Purchase'
      }],
      application_context: {
        return_url: config.paypal.returnUrl,
        cancel_url: config.paypal.cancelUrl
      }
    });
    const response = await client().execute(request);
    return {
      orderId: response.result.id,
      approvalLink: response.result.links.find(link => link.rel === 'approve').href
    };
  },
  
  captureOrder: async (orderId) => {
    const request = new orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await client().execute(request);
    return response.result;
  }
};
```

### 步骤 6：启用路由

在 `server.js` 中取消注释：

```javascript
app.use('/api/payment', paymentRoutes);
```

---

## 数据库表说明

### 新增表

1. **user_oauth_accounts** - 用户 OAuth 认证表
   - 存储 Google、GitHub 等第三方登录信息
   
2. **payments** - 支付记录表
   - 存储 PayPal、微信、支付宝等支付记录
   
3. **payment_configs** - 支付配置表
   - 存储支付提供商的配置信息
   
4. **sessions** - 会话表
   - 存储用户会话信息

### 已有表增强

- **users** - 用户表（已包含完整的用户信息和VIP字段）
- **products** - 产品表（已包含积分包、VIP订阅等产品）
- **orders** - 订单表（已包含订单和支付状态字段）
- **subscriptions** - 订阅记录表
- **user_points_logs** - 用户积分记录表

---

## API 接口说明

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/google` | Google OAuth 登录入口 |
| GET | `/api/auth/google/callback` | Google OAuth 回调 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 支付接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/payment/paypal/create` | 创建 PayPal 订单 |
| GET | `/api/payment/paypal/success` | PayPal 支付成功回调 |
| GET | `/api/payment/paypal/cancel` | PayPal 支付取消回调 |
| POST | `/api/payment/paypal/webhook` | PayPal Webhook |
| GET | `/api/payment/orders/:orderId` | 获取订单详情 |

---

## 快速检查清单

接入 Google Auth 和 PayPal 前，请确认：

- [ ] 已安装所需的 npm 包
- [ ] 已在 Google Cloud Console 和 PayPal Developer 中创建应用
- [ ] 已配置正确的环境变量（.env 文件）
- [ ] 已执行 database/init.sql 更新数据库表结构
- [ ] 已实现 lib/auth.js 和 lib/payment.js 中的预留函数
- [ ] 已在 server.js 中启用认证和支付路由
- [ ] 已配置 Webhook（PayPal）
- [ ] 已在沙盒环境中完整测试

---

## 技术支持

如有问题，请检查：
1. 环境变量是否正确配置
2. 数据库表是否完整
3. 网络连接是否正常
4. API 凭证是否有效
5. 日志文件中的错误信息
