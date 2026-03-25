-- 阿里千文图片生成功能数据库迁移脚本
USE generate_img;

-- 扩展 jobs 表，支持新的生成任务类型
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS task_type TINYINT DEFAULT 1 COMMENT '任务类型: 1-mermaid图表, 2-阿里千文图片生成' AFTER id,
ADD COLUMN IF NOT EXISTS prompt TEXT COMMENT '图片生成提示词' AFTER mermaid_content,
ADD COLUMN IF NOT EXISTS negative_prompt TEXT COMMENT '负面提示词' AFTER prompt,
ADD COLUMN IF NOT EXISTS image_size VARCHAR(20) COMMENT '图片尺寸: 1024*1024, 768*1024, 1024*768等' AFTER file_size,
ADD COLUMN IF NOT EXISTS image_count INT DEFAULT 1 COMMENT '生成图片数量' AFTER image_size,
ADD COLUMN IF NOT EXISTS seed INT COMMENT '随机种子' AFTER image_count,
ADD COLUMN IF NOT EXISTS ali_task_id VARCHAR(100) COMMENT '阿里千文任务ID' AFTER seed,
ADD INDEX IF NOT EXISTS idx_task_type (task_type);

-- 创建阿里千文生成任务详情表（可选，用于更详细的记录）
CREATE TABLE IF NOT EXISTS ali_image_gen_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  job_id VARCHAR(36) NOT NULL COMMENT '关联任务ID',
  ali_task_id VARCHAR(100) COMMENT '阿里千文任务ID',
  prompt TEXT NOT NULL COMMENT '提示词',
  negative_prompt TEXT COMMENT '负面提示词',
  image_size VARCHAR(20) DEFAULT '1024*1024' COMMENT '图片尺寸',
  image_count INT DEFAULT 1 COMMENT '生成图片数量',
  seed INT COMMENT '随机种子',
  model VARCHAR(50) COMMENT '使用的模型',
  api_request_id VARCHAR(100) COMMENT 'API请求ID',
  status VARCHAR(20) COMMENT '阿里千文任务状态',
  error_message TEXT COMMENT '错误信息',
  result_urls TEXT COMMENT '生成的图片URLs(JSON数组)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_job_id (job_id),
  INDEX idx_ali_task_id (ali_task_id),
  INDEX idx_status (status),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='阿里千文图片生成任务详情表';
