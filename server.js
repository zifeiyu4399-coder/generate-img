import express from 'express';
import { run } from '@mermaid-js/mermaid-cli';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 配置存储目录
const OUTPUT_DIR = path.join(__dirname, 'output');
const TMP_DIR = path.join(__dirname, 'tmp');

// 确保目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TMP_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

/**
 * @api {post} /api/generate 从 mermaid 文本内容生成图片
 * @apiDescription 直接传入 mermaid 图表文本，生成 PNG 图片返回
 * @apiParam {String} mermaidContent mermaid 图表文本内容
 * @apiSuccess {Object} 成功返回图片信息
 * @apiError {Object} 错误信息
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { mermaidContent } = req.body;
    
    if (!mermaidContent || typeof mermaidContent !== 'string') {
      return res.status(400).json({ error: 'mermaidContent is required and must be a string' });
    }
    
    const jobId = uuidv4();
    const inputPath = path.join(TMP_DIR, `${jobId}.mmd`);
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.png`);
    
    // 写入临时输入文件
    fs.writeFileSync(inputPath, mermaidContent);
    
    // mermaid-cli 配置
    const config = {
      puppeteerConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      outputFormat: 'png'
    };
    
    // 生成图片
    await run(inputPath, outputPath, config);
    
    // 清理临时输入文件
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    
    // 返回图片 URL 和信息
    const imageUrl = `/api/images/${jobId}.png`;
    res.json({
      success: true,
      jobId,
      imageUrl,
      message: 'Image generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate image' 
    });
  }
});

/**
 * @api {post} /api/generate/upload 上传 .mmd 文件生成图片
 * @apiDescription 上传 mermaid 图表文件，生成 PNG 图片返回
 * @apiParam {File} file .mmd 文件
 * @apiSuccess {Object} 成功返回图片信息
 * @apiError {Object} 错误信息
 */
app.post('/api/generate/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!req.file.originalname.endsWith('.mmd') && !req.file.originalname.endsWith('.mermaid')) {
      return res.status(400).json({ error: 'File must be .mmd or .mermaid' });
    }
    
    const jobId = uuidv4();
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.png`);
    
    // mermaid-cli 配置
    const config = {
      puppeteerConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      outputFormat: 'png'
    };
    
    // 生成图片
    await run(req.file.path, outputPath, config);
    
    // 清理上传的临时文件
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // 返回图片 URL 和信息
    const imageUrl = `/api/images/${jobId}.png`;
    res.json({
      success: true,
      jobId,
      imageUrl,
      originalFilename: req.file.originalname,
      message: 'Image generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating image from uploaded file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate image' 
    });
  }
});

/**
 * @api {get} /api/images/:filename 获取生成的图片
 * @apiDescription 获取已生成的 PNG 图片
 * @apiParam {String} filename 图片文件名
 * @apiSuccess {File} 返回 PNG 图片文件
 * @apiError {Object} 404 Not Found
 */
app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(OUTPUT_DIR, filename);
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  res.sendFile(imagePath);
});

/**
 * @api {delete} /api/images/:filename 删除生成的图片
 * @apiDescription 删除已生成的图片
 * @apiParam {String} filename 图片文件名
 * @apiSuccess {Object} 删除结果
 * @apiError {Object} 错误信息
 */
app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(OUTPUT_DIR, filename);
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  try {
    fs.unlinkSync(imagePath);
    res.json({
      success: true,
      message: `Image ${filename} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete image'
    });
  }
});

/**
 * @api {get} /api/health 健康检查
 * @apiDescription 检查服务是否正常运行
 * @apiSuccess {Object} 健康状态
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'generate-img',
    timestamp: new Date().toISOString()
  });
});

/**
 * @api {get} /api/list 列出所有生成的图片
 * @apiDescription 获取所有已生成的图片列表
 * @apiSuccess {Array} 图片列表
 */
app.get('/api/list', (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    const images = files
      .filter(file => file.endsWith('.png'))
      .map(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          jobId: file.replace('.png', ''),
          url: `/api/images/${file}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      });
    
    res.json({
      success: true,
      count: images.length,
      images
    });
    
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list images'
    });
  }
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 Generate-img API server running on port ${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/generate - Generate image from mermaid content`);
  console.log(`   POST /api/generate/upload - Generate image from uploaded .mmd file`);
  console.log(`   GET  /api/images/:filename - Get generated image`);
  console.log(`   DELETE /api/images/:filename - Delete generated image`);
  console.log(`   GET  /api/list - List all generated images`);
  console.log(`   GET  /api/health - Health check`);
});

export { app, server };
