/*
 * 用户模块核心文件 - 集成Mongoose模型、服务层、控制层和路由配置
 * @Author: enmotion 
 * @Date: 2025-05-07 12:23:41 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:34:37
 */
'use strict';

// 数据库相关依赖
import { mongoose } from "src/database";
import { SchemaDefinition } from "mongoose";

// 扩展模块配置
import ExpandClientSchema from "./expand/schema";
import type { ExpandClient } from "./expand/schema";

// 业务逻辑层依赖
import { ExpandClientService } from "./expand/service";
import { ExpandClientControllers } from "./expand/controller";

// 路由工具
import { mappingControllersAndRouter } from "@lib/routerTools";

// 常量定义
const _mongoDbCollectionName = 'client-collection'; // MongoDB集合名
const _routerPrefix = '/clients'; // API路由前缀

/**
 * 用户Schema定义
 * - 组合基础字段和扩展配置
 * - 强制类型检查确保与ExpandClient类型匹配
 * - 设置strict模式禁止未定义字段
 * - 创建复合索引(age+avatar)
 */
export const clientSchema = new mongoose.Schema<ExpandClient>(
  ExpandClientSchema as SchemaDefinition<ExpandClient>,
  { strict: true, timestamps:true }
);
// clientSchema.index({ age: 1, avatar: 1 }, { unique: true, sparse: true });

/**
 * Mongoose用户模型
 * - 绑定到指定集合名称
 * - 泛型参数确保文档类型安全
 */
export const userModel = mongoose.model<ExpandClient>(
  _mongoDbCollectionName, 
  clientSchema
);

/**
 * 用户服务实例
 * - 封装CRUD等业务逻辑
 * - 泛型保持与服务层类型一致
 */
export const ClientService = new ExpandClientService<ExpandClient>(userModel);

/**
 * 用户控制器实例
 * - 处理HTTP请求/响应
 * - 依赖注入服务层实例
 * - 携带Schema用于请求验证
 */
export const clientController = new ExpandClientControllers<ExpandClient>(
  ClientService, 
  clientSchema
);

/**
 * 自动生成的路由配置
 * - 公共接口使用/pub前缀
 * - RESTful风格路由设计
 * - 方法名映射控制器实际方法
 */
export const clientRouter = mappingControllersAndRouter<ExpandClientControllers<ExpandClient>>(
  _routerPrefix,
  clientController,
  [
    { routerPath: '/pub/login', method: 'post', handlerName: 'login' },
    { routerPath: '/pub/register', method: 'post', handlerName: 'register' },
    { routerPath: '/create', method: 'post', handlerName: 'create' },
    { routerPath:'/createOrUpdate',method:'post',handlerName:'save'},
    { routerPath: '/delete', method: 'delete', handlerName: 'deleteMany' },
    { routerPath: '/update', method: 'put', handlerName: 'updateOne' },
    { routerPath: '/updateMany', method: 'put', handlerName: 'updateMany' },
    { routerPath: '/findOne', method: 'get', handlerName: 'findOne' },
    { routerPath: '/find', method: 'post', handlerName: 'aggregate' },
    { routerPath: '/uniq', method: 'post', handlerName: 'uniqValidate' }
  ]
);

// 类型导出
export type { ExpandClient };
