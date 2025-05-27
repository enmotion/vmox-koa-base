/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @ Modified by: Your name
 * @ Modified time: 2025-05-28 00:06:12
 */
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
  /** 相对路径 */
  private relativePath: string;

  /**
   * 构造函数
   * 初始化上传目录路径并确保目录存在
   * @param uploadDir - 上传目录路径
   * @param relativePath - 相对路径，例如 'images/2024/03'
   */
  constructor(uploadDir: string, relativePath: string = '') {
    try {
      // 设置上传目录路径
      const baseDir = path.resolve(__dirname, '../../');
      this.uploadDir = path.resolve(baseDir, uploadDir);
      this.relativePath = relativePath.replace(/[\/\\]+/g, path.sep);
      
      // 构建完整的目标目录
      const targetDir = path.join(this.uploadDir, this.relativePath);
      
      console.log('Upload directory initialization:', {
        baseDir,
        uploadDir: this.uploadDir,
        relativePath: this.relativePath,
        targetDir,
        absolutePath: path.resolve(targetDir)
      });
      
      // 确保基础目录结构存在
      try {
        // 直接创建完整的目录结构
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('Base upload directory created:', {
          path: targetDir,
          exists: fs.existsSync(targetDir)
        });
      } catch (error) {
        console.error('Error creating base directories:', {
          error,
          baseDir,
          uploadDir: this.uploadDir,
          targetDir,
          errorCode: (error as NodeJS.ErrnoException).code,
          errorMessage: (error as NodeJS.ErrnoException).message
        });
        throw new Error(`Failed to create upload directory: ${(error as Error).message}`);
      }
    } catch (error) {
      console.error('Constructor error:', {
        error,
        errorCode: (error as NodeJS.ErrnoException).code,
        errorMessage: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * 确保上传目录存在
   * 如果目录不存在则创建，包括所有必要的父目录
   * @param dirPath - 要检查的目录路径，默认为上传目录
   */
  private ensureUploadDir(dirPath: string = this.uploadDir): void {
    console.log('Checking directory:', {
      path: dirPath,
      exists: fs.existsSync(dirPath),
      absolutePath: path.resolve(dirPath)
    });
    
    if (!fs.existsSync(dirPath)) {
      console.log('Creating directory...');
      try {
        // 确保父目录存在
        const parentDir = path.dirname(dirPath);
        if (!fs.existsSync(parentDir)) {
          console.log('Creating parent directory:', parentDir);
          fs.mkdirSync(parentDir, { recursive: true });
        }
        
        // 创建目标目录
        fs.mkdirSync(dirPath, { recursive: true });
        
        // 验证目录是否创建成功
        if (fs.existsSync(dirPath)) {
          console.log('Directory created successfully:', {
            path: dirPath,
            absolutePath: path.resolve(dirPath)
          });
        } else {
          throw new Error(`Failed to create directory: ${dirPath}`);
        }
      } catch (error) {
        console.error('Error creating directory:', {
          path: dirPath,
          error: error,
          errorCode: (error as NodeJS.ErrnoException).code,
          errorMessage: (error as NodeJS.ErrnoException).message
        });
        throw error;
      }
    }
  }

  /**
   * 创建指定深度的目录结构
   * @param relativePath - 相对于上传目录的路径
   * @returns 创建的完整目录路径
   */
  public createDirectory(relativePath: string): string {
    // 处理路径中的正斜杠和反斜杠
    const normalizedPath = relativePath.replace(/[\/\\]+/g, path.sep);
    const fullPath = path.join(this.uploadDir, normalizedPath);
    
    console.log('Creating directory structure:', {
      relativePath,
      normalizedPath,
      fullPath
    });
    
    this.ensureUploadDir(fullPath);
    return fullPath;
  }

  /**
   * 处理文件上传
   * @param files - 上传的文件或文件数组
   * @returns 处理结果数组，包含每个文件的信息
   */
  public async handleUpload(files: any): Promise<Array<{
    filename: string;    // 原始文件名
    hash: string;        // 文件hash值
    accessPath: string;  // 文件访问路径
    error?: string;      // 错误信息（如果有）
  }>> {
    if (!files) {
      throw new Error('No files provided for upload');
    }

    try {
      // 构建完整的存储路径
      const targetDir = path.join(this.uploadDir, this.relativePath);
      console.log('Target upload directory:', {
        relativePath: this.relativePath,
        targetDir,
        absolutePath: path.resolve(targetDir),
        uploadDir: this.uploadDir
      });

      // 确保files是数组形式
      const fileArray = Array.isArray(files) ? files : [files];
      if (fileArray.length === 0) {
        throw new Error('No files to process');
      }

      const results: Array<{
        filename: string;
        hash: string;
        accessPath: string;
        error?: string;
      }> = [];

      // 处理每个文件
      for (const file of fileArray) {
        try {
          if (!file || !file.filepath) {
            throw new Error('Invalid file object: missing filepath');
          }

          // 步骤1: 读取文件内容
          if (!fs.existsSync(file.filepath)) {
            throw new Error(`Source file not found: ${file.filepath}`);
          }
          
          const fileBuffer = fs.readFileSync(file.filepath);
          if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('File is empty or could not be read');
          }
          
          // 步骤2: 计算文件hash（取MD5的前12位）
          const fileHash = crypto.createHash('md5')
            .update(fileBuffer)
            .digest('hex')
            .slice(0, 12);
          
          // 步骤3: 获取文件扩展名并生成新文件名
          const ext = path.extname(file.originalFilename || '');
          const hashFileName = `${fileHash}${ext}`;
          
          // 步骤4: 构建完整的文件路径
          const uploadPath = path.join(targetDir, hashFileName);
          const uploadDirName = path.basename(this.uploadDir);
          const fileAccessPath = `/${uploadDirName}/${this.relativePath ? this.relativePath.replace(/\\/g, '/') + '/' : ''}${hashFileName}`;

          // 步骤5: 检查文件是否已存在，不存在则保存
          if (!fs.existsSync(uploadPath)) {
            fs.writeFileSync(uploadPath, fileBuffer);
          }

          // 步骤6: 清理临时文件
          try {
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
          } catch (err) {
            console.error('Error deleting temp file:', err);
          }

          // 步骤7: 记录成功结果
          results.push({
            filename: file.originalFilename,
            hash: fileHash,
            accessPath: fileAccessPath
          });

        } catch (fileErr) {
          results.push({
            filename: file.originalFilename,
            hash: '',
            accessPath: '',
            error: `Failed to process file: ${(fileErr as Error).message}`
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error in handleUpload:', {
        error,
        errorCode: (error as NodeJS.ErrnoException).code,
        errorMessage: (error as Error).message
      });
      throw error;
    }
  }
} 