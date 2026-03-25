/**
 * 认证中间件 - 为 Google Auth 和 JWT 预留设计
 */

/**
 * 可选认证中间件（不强制要求登录）
 */
export function optionalAuth(req, res, next) {
  // 后期实现可选认证逻辑
  // 1. 从 Authorization header 或 cookie 中获取 token
  // 2. 验证 token
  // 3. 如果有效，将用户信息挂载到 req.user
  // 4. 无论是否有效，都继续执行
  req.user = null; // 默认设置为 null
  next();
}

/**
 * 强制认证中间件（要求用户必须登录）
 */
export function requireAuth(req, res, next) {
  // 后期实现强制认证逻辑
  // 1. 从 Authorization header 或 cookie 中获取 token
  // 2. 验证 token
  // 3. 如果有效，将用户信息挂载到 req.user 并继续
  // 4. 如果无效，返回 401 Unauthorized
  
  // 预留设计 - 目前直接通过（后期需移除）
  console.warn('⚠️ requireAuth middleware is in placeholder mode');
  req.user = null;
  next();
  
  // 后期应实现的逻辑：
  /*
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Please login first'
    });
  }
  next();
  */
}

/**
 * 可选管理员认证中间件
 */
export function optionalAdmin(req, res, next) {
  // 后期实现管理员认证检查
  req.isAdmin = false;
  next();
}

/**
 * 强制管理员认证中间件
 */
export function requireAdmin(req, res, next) {
  // 后期实现强制管理员认证
  console.warn('⚠️ requireAdmin middleware is in placeholder mode');
  req.isAdmin = true;
  next();
  
  // 后期应实现的逻辑：
  /*
  if (!req.user || !req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Admin access required'
    });
  }
  next();
  */
}

/**
 * CSRF 保护中间件（预留）
 */
export function csrfProtection(req, res, next) {
  // 后期实现 CSRF 保护逻辑
  // 可以使用 'csurf' 中间件
  next();
}

export default {
  optionalAuth,
  requireAuth,
  optionalAdmin,
  requireAdmin,
  csrfProtection
};
