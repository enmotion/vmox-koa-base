/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @ Modified by: Your name
 * @ Modified time: 2025-05-24 20:32:00
 */
'use strict';
import { userService } from "@model/users-class";
import type { ExpandUser } from "@model/users-class";
import { FileUploadUtil } from '@lib/uploadTools';

/**
 * 系统服务层
 * 处理系统相关的业务逻辑，包括用户注册、登录、文件上传等
 */
export default function useSystemService<T extends Record<string,any>>(){
  /**
   * 注册系统用户
   */
  async function registerSystem(user:ExpandUser){
    try{
      const data = await userService.save(user,{checkKeys:true})
      return data
    }catch(err){
      throw err
    }
  }

  /**
   * 用户登录
   */
  async function login(user:Partial<ExpandUser>){

  }

  /**
   * 处理文件上传
   * @param files 上传的文件或文件数组
   * @returns 处理结果数组
   * @throws {Error} 当没有文件上传时抛出错误
   */
  async function handleFileUpload(files: any, path?:string) {
    // 参数验证
    if (!files) {
      throw {
        code: 400,
        msg: 'No files uploaded'
      };
    }
    try {
      console.log(path,'1111111111111111111111')
      const uploadUtil = new FileUploadUtil( path ?? process.env.APP_DEFAULT_UPLOAD_DIR as string);
      const results = await uploadUtil.handleUpload(files);
      return results;
    } catch (error) {
      console.error('File upload service error:', error);
      throw {
        code: 500,
        msg: 'Internal server error'
      };
    }
  }

  return {
    registerSystem,
    login,
    handleFileUpload,
  }
}