/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:23:41 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:34:37
 */
'use strict';

// 从项目数据库模块中导入 mongoose 实例，用于与 MongoDB 进行交互
import { mongoose } from "src/database";
import { Schema, SchemaDefinition } from "mongoose";
// 从 mongoose 库中导入 Schema 类型，用于定义 MongoDB 文档的结构

// 导入用户基础模式，该模式定义了用户文档的基本结构
import userBaseSchema from "./base/schema";
// 导入基础用户服务钩子函数，用于处理用户相关的业务逻辑
import useBaseUserService from "./base/service";
// 导入基础用户控制器钩子函数，用于处理用户相关的请求和响应
import useBaseUserController from "./base/controller";
// 导入用户扩展模式配置，该配置包含了用户文档的扩展字段和规则
import userExpandSchemaConfig from "./expand/schema";
// 导入扩展用户类型，用于类型检查和类型定义
import type { ExpandUser } from "./expand/schema";
// 导入路由工具函数，用于将控制器方法映射到路由上
import { mappingControllersAndRouter } from "@lib/routerTools";
import { mergeDeepRight } from "ramda";

// 定义 MongoDB 数据库集合的名称（类似于关系型数据库中的表名）
const _mongoDbCollectionName: string = 'user-collection'; 
// 定义路由前缀，用于区分不同模块的路由
const _routerPrefix = '/users';

/**
 * 合并用户基础模式和扩展模式配置，创建一个完整的用户模式。
 * 这里使用 add 方法将扩展模式配置添加到基础模式上，并将结果强制转换为 Schema 类型。
 */
export const userSchema = new mongoose.Schema<ExpandUser>(mergeDeepRight(userBaseSchema,userExpandSchemaConfig) as SchemaDefinition<ExpandUser>,{strict:true});

/**
 * 根据定义好的用户模式和集合名称，创建一个用户模型。
 * 该模型用于与 MongoDB 中的用户集合进行交互，并且使用 ExpandUser 类型进行类型检查。
 */
export const userModel = mongoose.model<ExpandUser>(_mongoDbCollectionName, userSchema);

/**
 * 使用基础用户服务钩子函数，传入用户模型和用户模式，创建一个用户服务实例。
 * 该服务实例用于处理用户相关的业务逻辑，如数据的增删改查等。
 */
export const userService = useBaseUserService<ExpandUser>(userModel);

/**
 * 使用基础用户控制器钩子函数，传入用户服务实例，创建一个用户控制器实例。
 * 该控制器实例用于处理用户相关的请求和响应，将业务逻辑委托给用户服务处理。
 */
export const userController = useBaseUserController<ExpandUser>(userService, userSchema); 

/**
 * 使用路由工具函数，将用户控制器的方法映射到具体的路由上。
 * 传入路由前缀、用户控制器实例和路由映射配置数组，返回一个用户路由实例。
 * 路由映射配置数组包含了每个路由的路径、请求方法和对应的控制器方法名。
 */
export const userRouter = mappingControllersAndRouter<ReturnType<typeof useBaseUserController>>(_routerPrefix, userController, [
  { routerPath: '/register', method: 'post', handlerName: 'register' },
  { routerPath: '/create', method: 'get', handlerName: 'create' },
  { routerPath: '/delete', method: 'delete', handlerName: 'delete' },
  { routerPath: '/update', method: 'put', handlerName: 'update' },
  { routerPath: '/find', method: 'get', handlerName: 'find' }
]);

// 导出扩展用户类型，方便其他模块使用
export type {
  ExpandUser
};