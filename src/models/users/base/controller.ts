'use strict';
// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useUserService from './service';
import useCoreSchema from "./schema";
import { register } from 'module';

export default function useUserController(service:ReturnType<typeof useUserService>){
  return {
    register:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.createUser(ctx.request.body as any)
        return ctx.body = JSON.stringify(result)
      }catch(err:any){
        if(['MongoServerError','ValidationError'].includes(err.name)){
          console.log('数据库错误')
        }
        return ctx.body = err
      }
    },
    create:async (ctx:ParameterizedContext)=>{
      try{
        const result = await service.createUser(ctx.query as any)
        return ctx.body = JSON.stringify(result)
      }catch(err){
        const errdata = Object(err);
        const fieldName = Object.keys(errdata.keyPattern)[0];
        const zhName = useCoreSchema.path(fieldName).options.zhName;
        console.log(Object(err),zhName)
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