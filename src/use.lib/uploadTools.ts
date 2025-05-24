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
    try {
      // 设置上传目录路径
      const baseDir = path.resolve(__dirname, '../../');
      this.uploadDir = path.resolve(baseDir, uploadDir);
      
      console.log('Upload directory initialization:', {
        baseDir,
        uploadDir: this.uploadDir,
        absolutePath: path.resolve(this.uploadDir)
      });
      
      // 确保基础目录结构存在
      try {
        // 直接创建完整的目录结构
        fs.mkdirSync(this.uploadDir, { recursive: true });
        console.log('Base upload directory created:', {
          path: this.uploadDir,
          exists: fs.existsSync(this.uploadDir)
        });
      } catch (error) {
        console.error('Error creating base directories:', {
          error,
          baseDir,
          uploadDir: this.uploadDir,
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
   * 处理文件上传到指定目录
   * @param files - 上传的文件或文件数组
   * @param relativePath - 相对于上传目录的路径，例如 'images/2024/03'
   * @returns 处理结果数组，包含每个文件的信息
   */
  public async handleUpload(files: any, relativePath: string = ''): Promise<Array<{
    filename: string;    // 原始文件名
    hash: string;        // 文件hash值
    accessPath: string;  // 文件访问路径
    error?: string;      // 错误信息（如果有）
  }>> {
    if (!files) {
      throw new Error('No files provided for upload');
    }

    try {
      // 规范化相对路径
      const normalizedPath = relativePath.replace(/[\/\\]+/g, path.sep);
      
      // 构建完整的存储路径
      const targetDir = path.join(this.uploadDir, normalizedPath);
      console.log('Target upload directory:', {
        relativePath,
        normalizedPath,
        targetDir,
        absolutePath: path.resolve(targetDir),
        uploadDir: this.uploadDir
      });

      // 确保目标目录存在
      try {
        // 分步创建目录
        const pathParts = normalizedPath.split(path.sep);
        let currentPath = this.uploadDir;
        
        for (const part of pathParts) {
          if (part) {
            currentPath = path.join(currentPath, part);
            if (!fs.existsSync(currentPath)) {
              console.log('Creating directory:', currentPath);
              fs.mkdirSync(currentPath);
            }
          }
        }
        
        console.log('Directory structure created:', {
          path: targetDir,
          exists: fs.existsSync(targetDir)
        });
      } catch (mkdirError) {
        console.error('Error creating directory structure:', {
          error: mkdirError,
          path: targetDir,
          errorCode: (mkdirError as NodeJS.ErrnoException).code,
          errorMessage: (mkdirError as NodeJS.ErrnoException).message
        });
        throw new Error(`Failed to create directory structure: ${(mkdirError as Error).message}`);
      }
      
      // 验证目录权限
      try {
        const testFile = path.join(targetDir, '.test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('Directory permissions verified:', targetDir);
      } catch (permError) {
        console.error('Directory permission error:', {
          path: targetDir,
          error: permError,
          errorCode: (permError as NodeJS.ErrnoException).code,
          errorMessage: (permError as Error).message
        });
        throw new Error(`No write permission for directory: ${targetDir}`);
      }
      
      // 确保files是数组形式
      const fileArray = Array.isArray(files) ? files : [files];
      if (fileArray.length === 0) {
        throw new Error('No files to process');
      }

      console.log('#############################################');
      console.log('Files to process:', fileArray.map(file => ({
        originalFilename: file.originalFilename,
        filepath: file.filepath,
        size: file.size
      })));
      console.log('Target directory:', targetDir);
      
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

          console.log('-----------------------------------------');
          console.log('Processing file:', {
            originalFilename: file.originalFilename,
            filepath: file.filepath,
            size: file.size
          });
          
          // 步骤1: 读取文件内容
          if (!fs.existsSync(file.filepath)) {
            throw new Error(`Source file not found: ${file.filepath}`);
          }
          
          const fileBuffer = fs.readFileSync(file.filepath);
          if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('File is empty or could not be read');
          }
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
          const uploadPath = path.join(targetDir, hashFileName);
          const fileAccessPath = `/uploads/${normalizedPath ? normalizedPath.replace(/\\/g, '/') + '/' : ''}${hashFileName}`;
          console.log('Upload path:', {
            uploadPath,
            absolutePath: path.resolve(uploadPath),
            fileAccessPath
          });

          // 步骤5: 检查文件是否已存在，不存在则保存
          if (!fs.existsSync(uploadPath)) {
            console.log('Saving new file...');
            try {
              // 写入文件
              fs.writeFileSync(uploadPath, fileBuffer);
              
              // 验证文件是否真的被保存
              if (fs.existsSync(uploadPath)) {
                const stats = fs.statSync(uploadPath);
                console.log('File verification:', {
                  exists: true,
                  size: stats.size,
                  path: uploadPath,
                  absolutePath: path.resolve(uploadPath)
                });

                // 验证文件内容
                const savedBuffer = fs.readFileSync(uploadPath);
                console.log('File content verification:', {
                  originalSize: fileBuffer.length,
                  savedSize: savedBuffer.length,
                  match: savedBuffer.equals(fileBuffer)
                });
              } else {
                throw new Error(`File was not saved properly: ${uploadPath}`);
              }
            } catch (saveError) {
              console.error('Error saving file:', {
                error: saveError,
                path: uploadPath,
                absolutePath: path.resolve(uploadPath),
                errorCode: (saveError as NodeJS.ErrnoException).code,
                errorMessage: (saveError as NodeJS.ErrnoException).message
              });
              throw new Error(`Failed to save file: ${(saveError as Error).message}`);
            }
          } else {
            console.log('File already exists, skipping save');
          }

          // 步骤6: 清理临时文件
          try {
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
              console.log('Temp file cleaned up');
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

          // 打印文件上传完成事件
          console.log(`文件上传完成: ${file.originalFilename} -> ${hashFileName}`);
        } catch (fileErr) {
          // 步骤8: 处理错误情况
          console.error('Error processing file:', fileErr);
          results.push({
            filename: file.originalFilename,
            hash: '',
            accessPath: '',
            error: `Failed to process file: ${(fileErr as Error).message}`
          });
        }
      }
      // 打印所有文件处理完成事件
      console.log(`所有文件处理完成，共处理 ${results.length} 个文件`);
      console.log('#############################################');
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