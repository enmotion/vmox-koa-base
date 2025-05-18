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

export default function useSystemController<T extends Record<string,any>>(service:ReturnType<typeof useUserService<T>>){
  return {
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