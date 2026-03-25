// 数据库、缓存、认证和支付配置
const config = {
  // MySQL 配置
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'generate_img',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0
  },
  
  // 缓存配置
  cache: {
    jobTTL: 3600, // 任务缓存过期时间（秒）
    listTTL: 60   // 列表缓存过期时间（秒）
  },
  
  // JWT 认证配置
  jwt: {
    secret: process.env.JWT_SECRET, // ⚠️ 生产环境必须设置此环境变量
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  
  // Session 配置
  session: {
    secret: process.env.SESSION_SECRET, // ⚠️ 生产环境必须设置此环境变量
    name: 'generate_img_sid',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    resave: false,
    saveUninitialized: false
  },
  
  // Google OAuth 配置 (预留)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['email', 'profile']
  },
  
  // PayPal 支付配置 (预留)
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    returnUrl: process.env.PAYPAL_RETURN_URL || '/api/paypal/success',
    cancelUrl: process.env.PAYPAL_CANCEL_URL || '/api/paypal/cancel'
  }
};

export default config;
