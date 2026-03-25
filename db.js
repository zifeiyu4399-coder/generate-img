import mysql from 'mysql2/promise';
import config from './config.js';

// 创建 MySQL 连接池
const pool = mysql.createPool(config.mysql);

/**
 * 测试数据库连接
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL 数据库连接失败:', error.message);
    return false;
  }
}

/**
 * 创建任务记录
 */
export async function createJob(jobData) {
  const { id, mermaidContent, originalFilename, imagePath, imageUrl, status = 'pending' } = jobData;
  const sql = `
    INSERT INTO jobs (id, mermaid_content, original_filename, image_path, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [id, mermaidContent || null, originalFilename || null, imagePath || null, imageUrl || null, status]);
}

/**
 * 更新任务状态
 */
export async function updateJobStatus(jobId, status, errorMessage = null) {
  const sql = `
    UPDATE jobs 
    SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  await pool.execute(sql, [status, errorMessage, jobId]);
}

/**
 * 获取任务详情
 */
export async function getJob(jobId) {
  const sql = 'SELECT * FROM jobs WHERE id = ?';
  const [rows] = await pool.execute(sql, [jobId]);
  return rows[0] || null;
}

/**
 * 获取任务列表
 */
export async function getJobs(limit = 100, offset = 0) {
  const sql = `
    SELECT * FROM jobs 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.execute(sql, [limit, offset]);
  return rows;
}

/**
 * 删除任务
 */
export async function deleteJob(jobId) {
  const sql = 'DELETE FROM jobs WHERE id = ?';
  await pool.execute(sql, [jobId]);
}

export { pool };
