/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @ Modified by: Your name
 * @ Modified time: 2025-06-07 08:15:31
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
    eventStream:async(ctx:ParameterizedContext)=>{
        ctx.respond = false;
        ctx.status = 200
        // 设置响应头
        ctx.set({
            'Content-Type': 'text/event-stream', // 必须设置为 text/event-stream
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        // 直接向 ctx.res 写入数据
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 4) {
                clearInterval(interval);
                // ctx.res.end(); // 结束响应
            }
            const data = { message: `Event ${count}`, timestamp: new Date() };
            ctx.res.write(`data: ${JSON.stringify(data)}\n\n`); // 写入符合 EventStream 规范的数据
            count++;
        }, 1000);
    
        // // 处理客户端断开连接
        // ctx.req.on('close', () => {
        //     ctx.res.end(); // 结束响应
        // });
    },

    stream:async(ctx:ParameterizedContext)=>{
        console.log(ctx.request.headers['content-type'])
        // 设置响应头
        try{
          console.log(ctx.request.headers['content-type']);
          const streamMessage = `在使用 Koa 框架处理 HTTP 请求时，如果你遇到返回404错误但数据能够正常接收的情况，这通常表明你的请求路径没有被正确匹配到任何一个路由处理器（route handler）。下面是一些可能的原因和解决方法...`;
    
          switch (ctx.request.headers['content-type']) {
            case 'application/json;charset=UTF-8, text/plain':
              ctx.respond = false;
              ctx.status = 200;
              console.log("text/plain");
               ctx.set({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
              });
    
              const text = streamMessage;
              for (let i = 0; i < text.length; i++) {
                ctx.res.write(text[i]); // 逐字写入响应流            
                await new Promise(resolve => setTimeout(resolve, 50)); // 每1000毫秒写入一个字
              }
              ctx.res.end(); // 结束响应流
              ctx.flush()
              break;
              //* ------------------------------------------- OK */
    
              // ctx.respond = false;
              // ctx.status = 200;
              // ctx.set({
              //   'Content-Type': 'text/event-stream',
              //   'Cache-Control': 'no-cache',
              //   'Connection': 'keep-alive'
              // });
    
              // const messages = [{content:1},{content:2},{content:3},{content:4},{content:5},{content:6},{content:7},];
    
              // const sendData = (data:any) => {
              //   ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
              // };
    
              // let index = 0;
              // const intervalId = setInterval(() => {
              //   if (index < messages.length) {
              //     const eventData = {
              //       choices: [
              //         {
              //           delta: {
              //             content: messages[index].content
              //           }
              //         }
              //       ]
              //     };
              //     sendData(eventData);
              //     index++;
              //   } else {
              //     sendData('[DONE]');
              //     clearInterval(intervalId);
              //     ctx.res.end();
              //   }
              // }, 1000);
    
            case 'application/json;charset=UTF-8, application/json':
              console.log("application/json");
              ctx.set('Content-Type', 'application/json');
              ctx.body = packResponse({ code: 200, msg: '成功', data: { message: streamMessage } });
              break;
    
            default:
              ctx.set('Content-Type', 'application/json');
              ctx.body = packResponse({ code: 500, msg: '格式不明' });
              break;
          }
        }catch (err) {
          throw err;
        }
      }
  }
}