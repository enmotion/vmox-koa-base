/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @ Modified by: Your name
 * @ Modified time: 2025-05-27 23:39:52
 */

"use strict"
// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useSystemService from './service';
import { Schema } from 'mongoose';
import { packResponse } from '@lib/serviceTools';

export default function useSystemController<T extends Record<string,any>>(service:ReturnType<typeof useSystemService<T>>){
  return {
    /**
     * @swagger
     * /api/system/pub/upload:
     *   post:
     *     summary: 上传文件
     *     description: 上传一个或多个文件到服务器
     *     tags: [System]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 description: 要上传的文件
     *     responses:
     *       200:
     *         description: 文件上传成功
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 code:
     *                   type: number
     *                   example: 200
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       filename:
     *                         type: string
     *                         description: 原始文件名
     *                       hash:
     *                         type: string
     *                         description: 文件hash值
     *                       accessPath:
     *                         type: string
     *                         description: 文件访问路径
     *       400:
     *         description: 没有上传文件
     *       500:
     *         description: 服务器内部错误
     */
    upload:async ( ctx:ParameterizedContext)=>{
      try {
        console.log('Upload request received:', {
          files: ctx.request.files,
          body: ctx.request.body
        });
        const path = ctx.request?.body?.path ? `${ctx.request.body.path}` : undefined;
        console.log('Upload path:', path);
        const results = await service.handleFileUpload(ctx.request.files?.file, path);
        console.log('Upload results:', results);
        
        return ctx.body = packResponse({
          data: results
        });
      } catch (err: any) {
        console.error('Upload error:', err);
        return ctx.body = packResponse(err);
      }
    },

    /**
     * @swagger
     * /api/system/register:
     *   post:
     *     summary: 注册系统用户
     *     description: 创建新的系统用户账号
     *     tags: [System]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 description: 用户名
     *               password:
     *                 type: string
     *                 description: 密码
     *     responses:
     *       200:
     *         description: 注册成功
     *       400:
     *         description: 参数错误
     *       500:
     *         description: 服务器内部错误
     */
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
    
    /**
     * @swagger
     * /api/system/sse2:
     *   get:
     *     summary: 用户登录
     *     description: 用户登录并获取认证令牌
     *     tags: [System]
     *     parameters:
     *       - in: query
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *         description: 用户名
     *       - in: query
     *         name: password
     *         required: true
     *         schema:
     *           type: string
     *         description: 密码
     *     responses:
     *       200:
     *         description: 登录成功
     *       401:
     *         description: 认证失败
     *       500:
     *         description: 服务器内部错误
     */
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