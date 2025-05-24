'use strict';

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * 文件上传工具类
 * 用于处理文件上传、生成文件hash、文件去重等功能
 */
export class FileUploadUtil {
  /** 文件上传目录路径 */
  private uploadDir: string;

  /**
   * 构造函数
   * 初始化上传目录路径并确保目录存在
   * @param uploadDir - 上传目录路径
   */
  constructor(uploadDir: string) {
    // 设置上传目录路径
    const baseDir = path.resolve(__dirname, '../../');
    this.uploadDir = path.resolve(baseDir, uploadDir ?? process.env.UPLOAD_DIR ?? 'public/uploads');
    
    console.log('Upload directory initialization:', {
      baseDir,
      uploadDir: this.uploadDir,
      absolutePath: path.resolve(this.uploadDir),
      envUploadDir: process.env.UPLOAD_DIR
    });
    
    // 确保上传目录存在
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   * 如果目录不存在则创建，包括所有必要的父目录
   */
  private ensureUploadDir(): void {
    console.log('Checking upload directory:', {
      path: this.uploadDir,
      exists: fs.existsSync(this.uploadDir)
    });
    
    if (!fs.existsSync(this.uploadDir)) {
      console.log('Creating upload directory...');
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log('Upload directory created');
    }
  }

  /**
   * 处理文件上传
   * 步骤：
   * 1. 将单个文件转换为数组形式处理
   * 2. 对每个文件：
   *    - 读取文件内容
   *    - 计算文件hash（取MD5的前12位）
   *    - 生成带hash的文件名
   *    - 检查文件是否已存在
   *    - 如果不存在则保存新文件
   *    - 清理临时文件
   *    - 记录处理结果
   * 
   * @param files - 上传的文件或文件数组
   * @returns 处理结果数组，包含每个文件的信息
   */
  public async handleUpload(files: any): Promise<Array<{
    filename: string;    // 原始文件名
    hash: string;        // 文件hash值
    accessPath: string;  // 文件访问路径
    error?: string;      // 错误信息（如果有）
  }>> {
    // 确保files是数组形式
    const fileArray = Array.isArray(files) ? files : [files];
    console.log('#############################################');
    console.log('Files to process:', fileArray.map(file => file.originalFilename));
    
    const results: Array<{
      filename: string;
      hash: string;
      accessPath: string;
      error?: string;
    }> = [];

    // 处理每个文件
    for (const file of fileArray) {
      try {
        console.log('-----------------------------------------');
        console.log('Processing file:', file.originalFilename);
        
        // 步骤1: 读取文件内容
        const fileBuffer = fs.readFileSync(file.filepath);
        console.log('File buffer read, size:', fileBuffer.length);
        
        // 步骤2: 计算文件hash（取MD5的前12位）
        const fileHash = crypto.createHash('md5')
          .update(fileBuffer)
          .digest('hex')
          .slice(0, 12);
        console.log('File hash calculated:', fileHash);
        
        // 步骤3: 获取文件扩展名并生成新文件名
        const ext = path.extname(file.originalFilename || '');
        const hashFileName = `${fileHash}${ext}`;
        console.log('Generated filename:', hashFileName);
        
        // 步骤4: 构建完整的文件路径
        const uploadPath = path.join(this.uploadDir, hashFileName);
        const fileAccessPath = `/uploads/${hashFileName}`;
        console.log('Upload path:', uploadPath);

        // 步骤5: 检查文件是否已存在，不存在则保存
        if (!fs.existsSync(uploadPath)) {
          console.log('Saving new file...');
          try {
            fs.writeFileSync(uploadPath, fileBuffer);
            console.log('File saved successfully at:', uploadPath);
            
            // 验证文件是否真的被保存
            if (fs.existsSync(uploadPath)) {
              const stats = fs.statSync(uploadPath);
              console.log('File verification:', {
                exists: true,
                size: stats.size,
                path: uploadPath
              });
            } else {
              console.error('File was not saved properly:', uploadPath);
            }
          } catch (saveError) {
            console.error('Error saving file:', {
              error: saveError,
              path: uploadPath,
              errorCode: (saveError as NodeJS.ErrnoException).code,
              errorMessage: (saveError as NodeJS.ErrnoException).message
            });
            throw saveError;
          }
        } else {
          console.log('File already exists, skipping save');
        }

        // 步骤6: 清理临时文件
        try {
          fs.unlinkSync(file.filepath);
          console.log('Temp file cleaned up');
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }

        // 步骤7: 记录成功结果
        results.push({
          filename: file.originalFilename,
          hash: fileHash,
          accessPath: fileAccessPath
        });

        // 打印文件上传完成事件
        console.log(`文件上传完成: ${file.originalFilename} -> ${hashFileName}`);
      } catch (fileErr) {
        // 步骤8: 处理错误情况
        console.error('Error processing file:', fileErr);
        results.push({
          filename: file.originalFilename,
          hash: '',
          accessPath: '',
          error: 'Failed to process file'
        });
      }
    }
    // 打印所有文件处理完成事件
    console.log(`所有文件处理完成，共处理 ${results.length} 个文件`);
    console.log('#############################################');
    return results;
  }
} 