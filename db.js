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

// ============================================
// 任务相关操作 (jobs)
// ============================================

/**
 * 创建任务记录（原始版本 - 向后兼容）
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
 * 增强版本的 createJob 函数，支持新字段
 */
export async function createJobV2(jobData) {
  const { 
    id, taskType = 1, mermaidContent, prompt, negativePrompt, 
    originalFilename, imagePath, imageUrl, status = 'pending',
    imageSize, imageCount, seed, aliTaskId 
  } = jobData;
  const sql = `
    INSERT INTO jobs (id, task_type, mermaid_content, prompt, negative_prompt, original_filename, image_path, image_url, status, image_size, image_count, seed, ali_task_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [
    id, taskType, mermaidContent || null, prompt || null, 
    negativePrompt || null, originalFilename || null, 
    imagePath || null, imageUrl || null, status,
    imageSize || null, imageCount || null, seed || null, aliTaskId || null
  ]);
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

// ============================================
// 用户相关操作 (users)
// ============================================

/**
 * 创建用户
 */
export async function createUser(userData) {
  const { uuid, username, email, phone, passwordHash, avatar, nickname } = userData;
  const sql = `
    INSERT INTO users (uuid, username, email, phone, password_hash, avatar, nickname)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [uuid, username, email || null, phone || null, passwordHash, avatar || null, nickname || null]);
  return result.insertId;
}

/**
 * 通过 ID 获取用户
 */
export async function getUserById(userId) {
  const sql = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [userId]);
  return rows[0] || null;
}

/**
 * 通过 UUID 获取用户
 */
export async function getUserByUuid(uuid) {
  const sql = 'SELECT * FROM users WHERE uuid = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [uuid]);
  return rows[0] || null;
}

/**
 * 通过邮箱获取用户
 */
export async function getUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
}

/**
 * 通过用户名获取用户
 */
export async function getUserByUsername(username) {
  const sql = 'SELECT * FROM users WHERE username = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [username]);
  return rows[0] || null;
}

/**
 * 更新用户信息
 */
export async function updateUser(userId, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['email', 'phone', 'avatar', 'nickname', 'status', 'points', 'total_points', 'used_points', 'vip_level', 'vip_expire_at', 'last_login_at', 'last_login_ip'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(userId);
  const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, values);
}

// ============================================
// OAuth 认证相关操作 (user_oauth_accounts)
// ============================================

/**
 * 创建 OAuth 认证记录
 */
export async function createOAuthAccount(oauthData) {
  const { userId, provider, providerUserId, providerUsername, email, avatarUrl, accessToken, refreshToken, tokenExpiresAt, scope } = oauthData;
  const sql = `
    INSERT INTO user_oauth_accounts (user_id, provider, provider_user_id, provider_username, email, avatar_url, access_token, refresh_token, token_expires_at, scope)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    userId, provider, providerUserId, providerUsername || null, email || null, avatarUrl || null,
    accessToken || null, refreshToken || null, tokenExpiresAt || null, scope || null
  ]);
  return result.insertId;
}

/**
 * 通过提供商和用户 ID 获取 OAuth 记录
 */
export async function getOAuthAccount(provider, providerUserId) {
  const sql = 'SELECT * FROM user_oauth_accounts WHERE provider = ? AND provider_user_id = ?';
  const [rows] = await pool.execute(sql, [provider, providerUserId]);
  return rows[0] || null;
}

/**
 * 获取用户的所有 OAuth 记录
 */
export async function getUserOAuthAccounts(userId) {
  const sql = 'SELECT * FROM user_oauth_accounts WHERE user_id = ? AND status = 1';
  const [rows] = await pool.execute(sql, [userId]);
  return rows;
}

/**
 * 更新 OAuth 认证记录
 */
export async function updateOAuthAccount(id, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['provider_username', 'email', 'avatar_url', 'access_token', 'refresh_token', 'token_expires_at', 'scope', 'status'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updates.push(`${dbField} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(id);
  const sql = `UPDATE user_oauth_accounts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, values);
}

// ============================================
// 订单相关操作 (orders)
// ============================================

/**
 * 创建订单
 */
export async function createOrder(orderData) {
  const { orderNo, userId, productId, productName, productType, orderType, amount, pointsAmount, payMethod, remark, expireTime } = orderData;
  const sql = `
    INSERT INTO orders (order_no, user_id, product_id, product_name, product_type, order_type, amount, points_amount, pay_method, remark, expire_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    orderNo, userId, productId || null, productName || null, productType || null, orderType,
    amount, pointsAmount || 0, payMethod || null, remark || null, expireTime || null
  ]);
  return result.insertId;
}

/**
 * 通过订单号获取订单
 */
export async function getOrderByNo(orderNo) {
  const sql = 'SELECT * FROM orders WHERE order_no = ?';
  const [rows] = await pool.execute(sql, [orderNo]);
  return rows[0] || null;
}

/**
 * 通过 ID 获取订单
 */
export async function getOrderById(orderId) {
  const sql = 'SELECT * FROM orders WHERE id = ?';
  const [rows] = await pool.execute(sql, [orderId]);
  return rows[0] || null;
}

/**
 * 获取用户订单列表
 */
export async function getUserOrders(userId, limit = 50, offset = 0) {
  const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const [rows] = await pool.execute(sql, [userId, limit, offset]);
  return rows;
}

/**
 * 更新订单
 */
export async function updateOrder(orderId, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['pay_method', 'pay_status', 'pay_time', 'transaction_id', 'order_status', 'cancel_reason', 'cancel_time'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updates.push(`${dbField} = ?`);
      values.push(updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(orderId);
  const sql = `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, values);
}

// ============================================
// 支付相关操作 (payments)
// ============================================

/**
 * 创建支付记录
 */
export async function createPayment(paymentData) {
  const { paymentNo, orderId, userId, paymentProvider, paymentMethod, amount, currency, extraData } = paymentData;
  const sql = `
    INSERT INTO payments (payment_no, order_id, user_id, payment_provider, payment_method, amount, currency, extra_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    paymentNo, orderId, userId, paymentProvider, paymentMethod || null,
    amount, currency || 'USD', extraData ? JSON.stringify(extraData) : null
  ]);
  return result.insertId;
}

/**
 * 通过支付流水号获取支付记录
 */
export async function getPaymentByNo(paymentNo) {
  const sql = 'SELECT * FROM payments WHERE payment_no = ?';
  const [rows] = await pool.execute(sql, [paymentNo]);
  return rows[0] || null;
}

/**
 * 通过订单 ID 获取支付记录
 */
export async function getPaymentsByOrderId(orderId) {
  const sql = 'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC';
  const [rows] = await pool.execute(sql, [orderId]);
  return rows;
}

/**
 * 更新支付记录
 */
export async function updatePayment(paymentId, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['provider_payment_id', 'status', 'paid_at', 'failure_reason', 'refund_amount', 'refunded_at', 'extra_data'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updates.push(`${dbField} = ?`);
      values.push(field === 'extra_data' && typeof updateData[field] === 'object' 
        ? JSON.stringify(updateData[field]) 
        : updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(paymentId);
  const sql = `UPDATE payments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, values);
}

// ============================================
// 产品相关操作 (products)
// ============================================

/**
 * 获取所有上架产品
 */
export async function getActiveProducts() {
  const sql = 'SELECT * FROM products WHERE status = 1 AND deleted_at IS NULL ORDER BY sort_order ASC, created_at DESC';
  const [rows] = await pool.execute(sql);
  return rows;
}

/**
 * 通过产品编码获取产品
 */
export async function getProductByCode(productCode) {
  const sql = 'SELECT * FROM products WHERE product_code = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [productCode]);
  return rows[0] || null;
}

/**
 * 通过 ID 获取产品
 */
export async function getProductById(productId) {
  const sql = 'SELECT * FROM products WHERE id = ? AND deleted_at IS NULL';
  const [rows] = await pool.execute(sql, [productId]);
  return rows[0] || null;
}

// ============================================
// 会话相关操作 (sessions)
// ============================================

/**
 * 创建会话
 */
export async function createSession(sessionData) {
  const { id, userId, ipAddress, userAgent, deviceType, expiresAt, data } = sessionData;
  const sql = `
    INSERT INTO sessions (id, user_id, ip_address, user_agent, device_type, expires_at, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.execute(sql, [
    id, userId || null, ipAddress || null, userAgent || null, 
    deviceType || null, expiresAt, data ? JSON.stringify(data) : null
  ]);
}

/**
 * 获取会话
 */
export async function getSession(sessionId) {
  const sql = 'SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP';
  const [rows] = await pool.execute(sql, [sessionId]);
  if (rows[0] && rows[0].data) {
    try {
      rows[0].data = JSON.parse(rows[0].data);
    } catch (e) {
      rows[0].data = null;
    }
  }
  return rows[0] || null;
}

/**
 * 更新会话
 */
export async function updateSession(sessionId, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['user_id', 'expires_at', 'data'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updates.push(`${dbField} = ?`);
      values.push(field === 'data' && typeof updateData[field] === 'object' 
        ? JSON.stringify(updateData[field]) 
        : updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(sessionId);
  const sql = `UPDATE sessions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, values);
}

/**
 * 删除会话
 */
export async function deleteSession(sessionId) {
  const sql = 'DELETE FROM sessions WHERE id = ?';
  await pool.execute(sql, [sessionId]);
}

/**
 * 清理过期会话
 */
export async function cleanExpiredSessions() {
  const sql = 'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP';
  await pool.execute(sql);
}

// ============================================
// 阿里千文图片生成任务相关操作 (ali_image_gen_tasks)
// ============================================

/**
 * 创建阿里千文图片生成任务记录
 */
export async function createAliImageGenTask(taskData) {
  const { jobId, aliTaskId, prompt, negativePrompt, imageSize, imageCount, seed, model, apiRequestId } = taskData;
  const sql = `
    INSERT INTO ali_image_gen_tasks (job_id, ali_task_id, prompt, negative_prompt, image_size, image_count, seed, model, api_request_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [
    jobId, aliTaskId || null, prompt, negativePrompt || null, 
    imageSize || '1024*1024', imageCount || 1, seed || null, 
    model || null, apiRequestId || null
  ]);
  return result.insertId;
}

/**
 * 通过 job_id 获取阿里千文任务
 */
export async function getAliImageGenTaskByJobId(jobId) {
  const sql = 'SELECT * FROM ali_image_gen_tasks WHERE job_id = ?';
  const [rows] = await pool.execute(sql, [jobId]);
  if (rows[0] && rows[0].result_urls) {
    try {
      rows[0].result_urls = JSON.parse(rows[0].result_urls);
    } catch (e) {
      rows[0].result_urls = null;
    }
  }
  return rows[0] || null;
}

/**
 * 更新阿里千文任务状态和结果
 */
export async function updateAliImageGenTask(jobId, updateData) {
  const updates = [];
  const values = [];
  
  const allowedFields = ['ali_task_id', 'status', 'error_message', 'result_urls'];
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      const dbField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updates.push(`${dbField} = ?`);
      values.push(field === 'result_urls' && Array.isArray(updateData[field]) 
        ? JSON.stringify(updateData[field]) 
        : updateData[field]);
    }
  }
  
  if (updates.length === 0) return;
  
  values.push(jobId);
  const sql = `UPDATE ali_image_gen_tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?`;
  await pool.execute(sql, values);
}

export { pool };
