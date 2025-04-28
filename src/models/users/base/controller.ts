// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import useUserService from './service';

export default function useUserController(service:ReturnType<typeof useUserService>){
  return {
    create:async (ctx:ParameterizedContext)=>{
      return service.createUser(ctx.request.body)
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