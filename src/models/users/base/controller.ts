/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict"
import * as R from "ramda";
// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useUserService from './service';
import type { IUser } from "./schema";
import { Schema } from 'mongoose';

export default function useUserController<T extends IUser>(service:ReturnType<typeof useUserService<T>>, schema:Schema<T>){
  return {
    register:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.createUser(ctx.request.body as any)
        return ctx.body = JSON.stringify(result)
      }catch(err:any){
        // if(!!err.msg && err.data?.errorName === "MongoServerError" && err.data?.errorCode === 11000 && R.keys(err.data?.options).length >= 2){
        //   err.msg = R.values(err.data.options).map(item=>item.name).join("+")+', 组合值已被占用'
        // }
        throw err
      }
    },
    create:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.createUser(ctx.query as any)
        return ctx.body = JSON.stringify(result)
      }catch(err){
        const errdata = Object(err);
        const fieldName = Object.keys(errdata.keyPattern)[0];
        const zhName = schema.path(fieldName).options.zhName;
        return ctx.body = {...errdata,zhName:zhName}
      }
    },
    delete:async (ctx:ParameterizedContext)=>{
      return service.deleteUser(ctx.request.body)
    },
    update:async (ctx:ParameterizedContext)=>{
      return service.updateUser(ctx.request.body)
    },
    find:async (ctx:ParameterizedContext)=>{
      console.log(ctx.query)
      return ctx.body = {message:'ok',data:ctx.query}
    },
  }
}