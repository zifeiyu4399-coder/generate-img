import redis from 'redis';
import config from './config.js';

// 创建 Redis 客户端
const client = redis.createClient(config.redis);

client.on('error', (err) => {
  console.error('❌ Redis 连接错误:', err);
});

client.on('connect', () => {
  console.log('✅ Redis 连接成功');
});

/**
 * 初始化 Redis 连接
 */
export async function initCache() {
  try {
    await client.connect();
    return true;
  } catch (error) {
    console.error('❌ Redis 初始化失败:', error.message);
    return false;
  }
}

/**
 * 获取缓存的任务
 */
export async function getCachedJob(jobId) {
  try {
    const key = `job:${jobId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取缓存任务失败:', error);
    return null;
  }
}

/**
 * 缓存任务
 */
export async function cacheJob(jobId, jobData, ttl = config.cache.jobTTL) {
  try {
    const key = `job:${jobId}`;
    await client.setEx(key, ttl, JSON.stringify(jobData));
  } catch (error) {
    console.error('缓存任务失败:', error);
  }
}

/**
 * 删除缓存的任务
 */
export async function deleteCachedJob(jobId) {
  try {
    const key = `job:${jobId}`;
    await client.del(key);
  } catch (error) {
    console.error('删除缓存任务失败:', error);
  }
}

/**
 * 获取缓存的任务列表
 */
export async function getCachedJobList() {
  try {
    const key = 'jobs:list';
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取缓存任务列表失败:', error);
    return null;
  }
}

/**
 * 缓存任务列表
 */
export async function cacheJobList(jobList, ttl = config.cache.listTTL) {
  try {
    const key = 'jobs:list';
    await client.setEx(key, ttl, JSON.stringify(jobList));
  } catch (error) {
    console.error('缓存任务列表失败:', error);
  }
}

/**
 * 清除任务列表缓存
 */
export async function invalidateJobListCache() {
  try {
    const key = 'jobs:list';
    await client.del(key);
  } catch (error) {
    console.error('清除任务列表缓存失败:', error);
  }
}

export { client };
