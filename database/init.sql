-- Generate-img 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS generate_img CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE generate_img;

-- 1. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  uuid VARCHAR(36) UNIQUE NOT NULL COMMENT '用户UUID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  avatar VARCHAR(500) COMMENT '头像URL',
  nickname VARCHAR(50) COMMENT '昵称',
  status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-冻结',
  points INT DEFAULT 0 COMMENT '用户积分',
  total_points INT DEFAULT 0 COMMENT '累计获得积分',
  used_points INT DEFAULT 0 COMMENT '已使用积分',
  vip_level TINYINT DEFAULT 0 COMMENT 'VIP等级: 0-普通用户, 1-VIP1, 2-VIP2, 3-VIP3',
  vip_expire_at TIMESTAMP NULL COMMENT 'VIP过期时间',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  last_login_ip VARCHAR(45) COMMENT '最后登录IP',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  INDEX idx_uuid (uuid),
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_vip_level (vip_level),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 产品信息表 (products)
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID',
  product_code VARCHAR(50) UNIQUE NOT NULL COMMENT '产品编码',
  product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
  product_type TINYINT NOT NULL COMMENT '产品类型: 1-积分包, 2-订阅服务, 3-单次服务',
  description TEXT COMMENT '产品描述',
  price DECIMAL(10,2) NOT NULL COMMENT '价格(元)',
  original_price DECIMAL(10,2) COMMENT '原价(元)',
  points INT DEFAULT 0 COMMENT '包含积分数量',
  duration_days INT COMMENT '有效期(天),订阅服务专用',
  vip_level TINYINT DEFAULT 0 COMMENT '关联VIP等级',
  image_url VARCHAR(500) COMMENT '产品图片URL',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  status TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
  is_hot TINYINT DEFAULT 0 COMMENT '是否热门: 0-否, 1-是',
  is_recommend TINYINT DEFAULT 0 COMMENT '是否推荐: 0-否, 1-是',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间',
  INDEX idx_product_code (product_code),
  INDEX idx_product_type (product_type),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品信息表';

-- 3. 订单表 (orders)
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  product_id BIGINT UNSIGNED COMMENT '产品ID',
  product_name VARCHAR(100) COMMENT '产品名称快照',
  product_type TINYINT COMMENT '产品类型快照',
  order_type TINYINT NOT NULL COMMENT '订单类型: 1-购买产品, 2-积分消费, 3-订阅续费',
  amount DECIMAL(10,2) NOT NULL COMMENT '订单金额(元)',
  points_amount INT DEFAULT 0 COMMENT '积分变动数量: 正-获得, 负-消耗',
  pay_method TINYINT COMMENT '支付方式: 1-微信支付, 2-支付宝, 3-积分支付',
  pay_status TINYINT DEFAULT 0 COMMENT '支付状态: 0-待支付, 1-已支付, 2-支付失败, 3-已退款',
  pay_time TIMESTAMP NULL COMMENT '支付时间',
  transaction_id VARCHAR(100) COMMENT '第三方支付流水号',
  order_status TINYINT DEFAULT 0 COMMENT '订单状态: 0-待处理, 1-处理中, 2-已完成, 3-已取消, 4-已退款',
  remark VARCHAR(500) COMMENT '订单备注',
  cancel_reason VARCHAR(500) COMMENT '取消原因',
  cancel_time TIMESTAMP NULL COMMENT '取消时间',
  expire_time TIMESTAMP NULL COMMENT '订单过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_pay_status (pay_status),
  INDEX idx_order_status (order_status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 4. 订阅记录表 (subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订阅ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  order_id BIGINT UNSIGNED COMMENT '关联订单ID',
  product_id BIGINT UNSIGNED COMMENT '产品ID',
  subscription_type TINYINT NOT NULL COMMENT '订阅类型: 1-VIP订阅, 2-功能订阅',
  vip_level TINYINT DEFAULT 0 COMMENT 'VIP等级',
  start_time TIMESTAMP NOT NULL COMMENT '订阅开始时间',
  end_time TIMESTAMP NOT NULL COMMENT '订阅结束时间',
  auto_renew TINYINT DEFAULT 0 COMMENT '是否自动续费: 0-否, 1-是',
  status TINYINT DEFAULT 1 COMMENT '状态: 0-已过期, 1-生效中, 2-已取消',
  cancel_reason VARCHAR(500) COMMENT '取消原因',
  cancel_time TIMESTAMP NULL COMMENT '取消时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  INDEX idx_status (status),
  INDEX idx_end_time (end_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅记录表';

-- 5. 用户积分记录表 (user_points_logs)
CREATE TABLE IF NOT EXISTS user_points_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  order_id BIGINT UNSIGNED COMMENT '关联订单ID',
  points_change INT NOT NULL COMMENT '积分变动: 正-增加, 负-减少',
  points_before INT NOT NULL COMMENT '变动前积分',
  points_after INT NOT NULL COMMENT '变动后积分',
  change_type TINYINT NOT NULL COMMENT '变动类型: 1-购买获得, 2-签到奖励, 3-活动奖励, 4-消费使用, 5-管理员调整, 6-退款返还',
  related_type VARCHAR(50) COMMENT '关联业务类型',
  related_id VARCHAR(100) COMMENT '关联业务ID',
  description VARCHAR(500) COMMENT '变动说明',
  operator_id BIGINT UNSIGNED COMMENT '操作人ID(管理员操作时)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_change_type (change_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分记录表';

-- 6. 用户操作日志表 (user_action_logs)
CREATE TABLE IF NOT EXISTS user_action_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  user_id BIGINT UNSIGNED COMMENT '用户ID(访客为空)',
  session_id VARCHAR(100) COMMENT '会话ID',
  action_type VARCHAR(50) NOT NULL COMMENT '操作类型: login, logout, register, generate_image, view_profile等',
  action_module VARCHAR(50) COMMENT '操作模块: user, order, product, api等',
  action_desc VARCHAR(500) COMMENT '操作描述',
  request_method VARCHAR(10) COMMENT '请求方法: GET, POST, PUT, DELETE等',
  request_url VARCHAR(500) COMMENT '请求URL',
  request_params TEXT COMMENT '请求参数(JSON)',
  response_status INT COMMENT '响应状态码',
  response_time INT COMMENT '响应时间(毫秒)',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent VARCHAR(500) COMMENT '用户代理',
  referer VARCHAR(500) COMMENT '来源页面',
  device_type VARCHAR(20) COMMENT '设备类型: desktop, mobile, tablet',
  browser VARCHAR(50) COMMENT '浏览器',
  os VARCHAR(50) COMMENT '操作系统',
  extra_data TEXT COMMENT '额外数据(JSON)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_action_type (action_type),
  INDEX idx_action_module (action_module),
  INDEX idx_ip_address (ip_address),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户操作日志表';

-- 7. 任务表 (jobs) - 保留原有表结构并增强
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(36) PRIMARY KEY COMMENT '任务ID (UUID)',
  user_id BIGINT UNSIGNED COMMENT '用户ID(访客为空)',
  mermaid_content TEXT COMMENT 'mermaid 图表内容',
  original_filename VARCHAR(255) COMMENT '原始文件名（如果是文件上传）',
  image_path VARCHAR(500) COMMENT '生成的图片路径',
  image_url VARCHAR(500) COMMENT '生成的图片 URL',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '任务状态',
  error_message TEXT COMMENT '错误信息（如果失败）',
  processing_time INT COMMENT '处理耗时(毫秒)',
  file_size INT COMMENT '生成文件大小(字节)',
  points_cost INT DEFAULT 0 COMMENT '消耗积分数',
  source_type TINYINT DEFAULT 1 COMMENT '来源类型: 1-API, 2-Web端, 3-移动端',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生成任务表';

-- 初始化一些产品数据
INSERT INTO products (product_code, product_name, product_type, description, price, original_price, points, duration_days, vip_level, sort_order, status, is_hot, is_recommend) VALUES
('POINTS_100', '100积分包', 1, '购买即得100积分，可用于图片生成', 9.90, 19.90, 100, NULL, 0, 1, 1, 0, 0),
('POINTS_500', '500积分包', 1, '购买即得500积分，可用于图片生成', 39.90, 99.00, 500, NULL, 0, 2, 1, 1, 0),
('POINTS_1000', '1000积分包', 1, '购买即得1000积分，可用于图片生成', 69.90, 199.00, 1000, NULL, 0, 3, 1, 0, 1),
('VIP_MONTH', '月度VIP会员', 2, '畅享30天VIP特权，无限次生成图片', 29.90, 59.90, 0, 30, 1, 4, 1, 1, 1),
('VIP_QUARTER', '季度VIP会员', 2, '畅享90天VIP特权，无限次生成图片', 79.90, 179.70, 0, 90, 2, 5, 1, 0, 1),
('VIP_YEAR', '年度VIP会员', 2, '畅享365天VIP特权，无限次生成图片', 199.00, 718.80, 0, 365, 3, 6, 1, 1, 1),
('SINGLE_GENERATE', '单次生成', 3, '单次图片生成服务', 1.00, 2.00, 0, NULL, 0, 7, 1, 0, 0);
