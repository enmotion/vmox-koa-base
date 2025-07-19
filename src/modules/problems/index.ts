/*
 * 问题集模块核心文件 - 集成Mongoose模型、服务层、控制层和路由配置
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 */
'use strict';

// 数据库相关依赖
import { mongoose } from "src/database";
import { SchemaDefinition } from "mongoose";

// 扩展模块配置
import expandProblemSchema from "./expand/schema";
import type { ExpandProblem } from "./expand/schema";

// 业务逻辑层依赖
import { ExpandProblemService } from "./expand/service";
import { ExpandProblemControllers } from "./expand/controller";

// 路由工具
import { mappingControllersAndRouter } from "@lib/routerTools";
import { unique } from "agenda/dist/job/unique";

// 常量定义
const _mongoDbCollectionName = 'problem-collection'; // MongoDB集合名
const _routerPrefix = '/problems'; // API路由前缀

/**
 * 问题集Schema定义
 * - 组合基础字段和扩展配置
 * - 强制类型检查确保与ExpandProblem类型匹配
 * - 设置strict模式禁止未定义字段
 * - 创建复合索引(difficultyLevel+gradeLevel+status)
 */
export const problemSchema = new mongoose.Schema<ExpandProblem>(
  expandProblemSchema as SchemaDefinition<ExpandProblem>,
  { strict: true, timestamps: true }
);

// 创建复合索引优化查询性能
problemSchema.index({ difficultyLevel: 1, gradeLevel: 1, status: 1, super: 1 });

/**
 * Mongoose问题集模型
 * - 绑定到指定集合名称
 * - 泛型参数确保文档类型安全
 */
export const problemModel = mongoose.model<ExpandProblem>(
  _mongoDbCollectionName, 
  problemSchema
);

/**
 * 问题集服务实例
 * - 封装CRUD等业务逻辑
 * - 泛型保持与服务层类型一致
 */
export const problemService = new ExpandProblemService<ExpandProblem>(problemModel);

/**
 * 问题集控制器实例
 * - 处理HTTP请求/响应
 * - 依赖注入服务层实例
 * - 携带Schema用于请求验证
 */
export const problemController = new ExpandProblemControllers<ExpandProblem>(
  problemService, 
  problemSchema
);

/**
 * 自动生成的路由配置
 * - 公共接口使用/pub前缀
 * - RESTful风格路由设计
 * - 方法名映射控制器实际方法
 */
export const problemRouter = mappingControllersAndRouter<ExpandProblemControllers<ExpandProblem>>(
  _routerPrefix,
  problemController,
  [
    // 基础CRUD接口
    { routerPath: '/save', method: 'post', handlerName: 'save' },
    { routerPath: '/delete', method: 'delete', handlerName: 'deleteMany' },
    { routerPath: '/updateMany', method: 'put', handlerName: 'updateMany' },
    { routerPath: '/findOne', method: 'get', handlerName: 'findOne' },
    { routerPath: '/find', method: 'post', handlerName: 'aggregate' },
  ]
);

// 类型导出
export type { ExpandProblem }; 