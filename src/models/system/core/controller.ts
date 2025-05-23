/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @ Modified by: Your name
 * @ Modified time: 2025-05-23 23:45:13
 */

"use strict"
// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useUserService from './service';
import { Schema } from 'mongoose';
import { packResponse } from '@lib/serviceTools';

export default function useSystemController<T extends Record<string,any>>(service:ReturnType<typeof useUserService<T>>){
  return {
    
    upload:async ( ctx:ParameterizedContext)=>{
      try {
        console.log('Upload request received:', {
          files: ctx.request.files,
          body: ctx.request.body
        });
        
        const results = await service.handleFileUpload(ctx.request.files?.file);
        console.log('Upload results:', results);
        
        return ctx.body = packResponse({
          data: results
        });
      } catch (err: any) {
        console.error('Upload error:', err);
        return ctx.body = packResponse(err);
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