import type { IUser } from "./base/schema";
import type { Mongoose } from "mongoose";
import userBaseSchema from "./base/schema";
import useBaseUserService from "./base/service";
import useBaseUserController from "./base/controller";
import useBaseUserRouter from './base/routers';

/**
 * 
 * @param mongoose 数据库链接实例
 * @param prefix 路由前缀地址
 * @returns 
 * schema => service => controllers => router
 */
export function userUserModel(mongoose:Mongoose,prefix:string='/users'){
  // 获取当前的 Schema
  const userSchema = userBaseSchema
  // 获取数据查询模型
  const userModel = mongoose.model<IUser>('user', userSchema) 
  // 注入查询模型，创建 service
  const userService = useBaseUserService(userModel, userSchema) 
  // 注入 service 创建 controllers
  const controller = useBaseUserController(userService); 
  // 注入 controller 创建实例
  const router = useBaseUserRouter('/users',controller) 
  return {
    userModel,
    userService,
    controller,
    router
  }
}