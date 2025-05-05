import { mergeDeepRight } from "ramda";
import type { Mongoose, Schema } from "mongoose";

import userBaseSchema from "./base/schema";
import useBaseUserService from "./base/service";
import useBaseUserController from "./base/controller";
import userExpandSchemaConfig from "./expand/schema";
import type { ExpandUser } from "./expand/schema";

import { mappingControllersAndRouter } from "@lib/routerTools";
/**
 * 
 * @param mongoose 数据库链接实例
 * @param prefix 路由前缀地址
 * @returns 
 * schema => service => controllers => router
 */
export function userUserModel(mongoose:Mongoose, prefix:string=''){
  // 获取当前的 Schema
  const userSchema = userBaseSchema.add(userExpandSchemaConfig) as Schema;
  // 获取数据查询模型
  const userModel = mongoose.model<ExpandUser>('user-collection', userSchema) 
  // 注入查询模型，创建 service
  const userService = useBaseUserService<ExpandUser>(userModel, userSchema) 
  // 注入 service 创建 controllers
  const controller = useBaseUserController<ExpandUser>(userService); 
  // 注入 controller 创建实例
  const router = mappingControllersAndRouter<ReturnType<typeof useBaseUserController>>(prefix,controller,[
    {routerPath:'/register',httpMethod:'post',handlerName:'register'},
    {routerPath:'/create',httpMethod:'get',handlerName:'create'},
    {routerPath:'/delete',httpMethod:'delete',handlerName:'delete'},
    {routerPath:'/update',httpMethod:'put',handlerName:'update'},
    {routerPath:'/find',httpMethod:'get',handlerName:'find'}
  ]) 
  return {
    userModel,
    userService,
    controller,
    router,
    userSchema
  }
}