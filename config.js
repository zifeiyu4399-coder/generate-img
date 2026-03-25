// 数据库和缓存配置
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
  }
};

export default config;
