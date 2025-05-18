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

import * as JWT from "jsonwebtoken";
import { Schema } from 'mongoose';
import { packResponse,fieldsFilter } from "@lib/serviceTools";

export default function useUserController<T extends IUser>(service:ReturnType<typeof useUserService<T>>, schema:Schema<T>){
  return {
    register:async (ctx:ParameterizedContext)=>{
      try{  
        const data = fieldsFilter.call(await service.createUser(ctx.request.body as any))
        ctx.body = packResponse({data})
      }catch(err:any){
        if(!!err.msg && err.data?.errorName === "MongoServerError" && err.data?.errorCode === 11000 && R.keys(err.data?.options).length >= 2){
          err.msg = R.values(err.data.options).map(item=>item.name).join("+")+', 组合值已被占用'
        }
        throw err
      }
    },
    login:async (ctx:ParameterizedContext)=>{
      try{
        const queryData = R.pick(['username','password'],R.mergeAll([{username:null,password:null},ctx.request.body??{}]));
        const res = fieldsFilter.call(await service.findOneUser(queryData as any),{omit:['_id']});
        if(!!res){
          const token = JWT.sign(R.pick(['username','uid'],res),'sere', {expiresIn:'24h'});
          ctx.body = packResponse({
            data:R.mergeDeepRight(res,{token}),
            code:200,
            msg:`欢迎回来 ${ res.nickname ?? res.username }`
          })
        }else{
          ctx.body = packResponse({
            code:400,
            data:null,
            msg:'用户名或密码,缺失或错误'
          })
        }
      }catch(err:any){
        throw err
      }
    },
    create:async (ctx:ParameterizedContext)=>{
      try{
        const res = await service.createUser(ctx.query as any)
        return ctx.body = JSON.stringify(res)
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