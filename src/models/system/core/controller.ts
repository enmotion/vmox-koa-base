/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict"
// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useUserService from './service';
import { Schema } from 'mongoose';
import { packResponse } from '@lib/serviceTools';
import fs from 'fs';
import path from 'path';

export default function useSystemController<T extends Record<string,any>>(service:ReturnType<typeof useUserService<T>>){
  return {
    upload:async ( ctx:ParameterizedContext)=>{
      console.log(ctx.request.files,'11111')
      try {
        const file = ctx.request.files?.file; // 假设前端字段名为 'file'
        if (!file) {
          ctx.status = 400;
          ctx.body = { error: 'No file uploaded' };
          return;
        }

        // 处理单文件（若允许多文件，需遍历 files.file）
        if (Array.isArray(file)) {
          ctx.status = 400;
          ctx.body = { error: 'Multiple files not allowed' };
          return;
        }

        // 创建可读流并保存到指定路径
        const reader = fs.createReadStream(file.filepath);
        const uploadPath = path.join(__dirname, '../../uploads', file.originalFilename || 'upload');
        const writer = fs.createWriteStream(uploadPath);

        reader.pipe(writer);

        ctx.status = 200;
        ctx.body = { message: 'File uploaded successfully', filename: file.originalFilename };
      } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
      }
    },
    register:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.registerSystem(ctx.request.body as any)
        return ctx.body = packResponse({
          data:result,
        })
      }catch(err:any){
        return ctx.body = err
      }
    },
    login:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.login(ctx.query as any)
        return ctx.body = JSON.stringify(result)
      }catch(err){
        
        return ctx.body = {}
      }
    },
  }
}