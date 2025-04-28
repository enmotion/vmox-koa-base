import Router from 'koa-router';
import { userSchema, type IUser } from "./core/schema";
import type { ParameterizedContext } from "koa";
import type { Mongoose } from "mongoose";
import { useUserService } from "./core/service";
import { useUserController } from "./core/controller";
import { useUserRouter } from './core/routers';

/**
 * 
 * @param mongoose 数据库链接实例
 * @param prefix 路由前缀地址
 * @returns 
 * schema => service => controllers => router
 */
export function userUserModel(mongoose:Mongoose,prefix:string='/users'){
  // 获取数据查询模型
  const userModel = mongoose.model<IUser>('user',userSchema) 
  // 注入查询模型，创建 service
  const userService = useUserService(userModel) 
  // 注入 service 创建 controllers
  const controller = useUserController(userService); 
  // 注入 controller 创建实例
  const router = useUserRouter('/users',controller) 
  return {
    userModel,
    userService,
    controller,
    router
  }
}