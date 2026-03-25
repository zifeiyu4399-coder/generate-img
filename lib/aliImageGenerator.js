import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AliImageGenerator {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.model = config.model;
    this.timeout = config.timeout;
  }

  async generateImage(prompt, options = {}) {
    const {
      size = '1024*1024',
      n = 1,
      seed = Math.floor(Math.random() * 2147483647)
    } = options;

    if (!this.apiKey) {
      throw new Error('阿里千文 API Key 未配置');
    }

    if (!prompt) {
      throw new Error('提示词不能为空');
    }

    const requestBody = {
      model: this.model,
      input: {
        prompt: prompt
      },
      parameters: {
        size: size,
        n: n,
        seed: seed
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`阿里千文 API 请求失败: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.code && result.code !== '200') {
        throw new Error(`阿里千文 API 错误: ${result.message || result.code}`);
      }

      return this.formatResponse(result);

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('阿里千文 API 请求超时');
      }
      throw error;
    }
  }

  async getTaskStatus(taskId) {
    if (!this.apiKey) {
      throw new Error('阿里千文 API Key 未配置');
    }

    const url = `${this.apiUrl.replace('/image-synthesis', '')}/tasks/${taskId}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`获取任务状态失败: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return this.formatTaskStatusResponse(result);

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('获取任务状态请求超时');
      }
      throw error;
    }
  }

  async downloadImage(imageUrl, outputPath) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
  }

  formatResponse(result) {
    const output = result.output || {};
    const usage = result.usage || {};

    return {
      success: true,
      taskId: output.task_id || result.request_id,
      status: output.task_status || 'succeeded',
      results: output.results || [],
      usage: {
        imageCount: usage.image_count || 0
      },
      requestId: result.request_id
    };
  }

  formatTaskStatusResponse(result) {
    const output = result.output || {};
    const usage = result.usage || {};

    return {
      success: true,
      taskId: result.request_id,
      status: output.task_status,
      results: output.results || [],
      code: result.code,
      message: result.message,
      usage: {
        imageCount: usage.image_count || 0
      }
    };
  }
}

export default AliImageGenerator;
