-- Generate-img 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS generate_img CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE generate_img;

-- 任务表
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(36) PRIMARY KEY COMMENT '任务ID (UUID)',
  mermaid_content TEXT COMMENT 'mermaid 图表内容',
  original_filename VARCHAR(255) COMMENT '原始文件名（如果是文件上传）',
  image_path VARCHAR(500) COMMENT '生成的图片路径',
  image_url VARCHAR(500) COMMENT '生成的图片 URL',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '任务状态',
  error_message TEXT COMMENT '错误信息（如果失败）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生成任务表';
