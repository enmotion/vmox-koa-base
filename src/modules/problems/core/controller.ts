/*
 * 问题集控制器模块 - 处理问题集相关HTTP请求
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 */

"use strict";
import * as R from "ramda";  // 函数式编程工具库
import { ParameterizedContext } from "koa";  // Koa上下文类型
import { ProblemService } from "./service";  // 问题集服务层
import type { IProblem } from "./schema";  // 问题集模型接口
import { getPagination, getSort } from "@lib/serviceTools";
import { Schema, RootFilterQuery } from "mongoose";  // Mongoose模式类型
import { packResponse, fieldsFilter, getFilter } from "@lib/serviceTools";  // 响应处理工具

/**
 * 问题集控制器类
 * @template T 扩展自IProblem的泛型类型
 */
export class ProblemControllers<T extends IProblem> {
  public service: ProblemService<T>;  // 问题集服务实例
  public schema: Schema<T>;  // Mongoose模式实例

  /**
   * 构造函数
   * @param service 注入的问题集服务
   * @param schema 问题集数据模式
   */
  public constructor(service: ProblemService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }

  /**
   * 创建问题集方法
   * @param ctx Koa上下文对象
   * @throws 抛出数据库操作异常
   */
  public create = async (ctx: ParameterizedContext) => {
    try {
      // 创建问题集数据并过滤返回值
      const body = getFilter(ctx.request?.body ?? {}) // 请求值与查询条件的转换
      const data = fieldsFilter.call(
        await this.service.save(body as any)
      ); // 返回值 字段过滤
      ctx.body = packResponse({ data });
    } catch (err: any) {
      // 处理MongoDB唯一键冲突错误(11000)
      if (
        !!err.msg &&
        err.data?.errorName === "MongoServerError" &&
        err.data?.errorCode === 11000 &&
        R.keys(err.data?.options).length >= 2
      ) {
        err.msg =
          R.values(err.data.options)
            .map((item) => item.name)
            .join("+") + ", 组合值已被占用";
      }
      throw err;
    }
  };

  /**
   * 保存或更新问题集方法
   * @param ctx Koa上下文对象
   * @returns 保存或更新结果
   */
  public save = async (ctx: ParameterizedContext) => {
    const body: Record<string, any> = ctx.request.body;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const extraData = !body?.uid ? { createdUser: ctx.visitor.uid } : { updatedUser: ctx.visitor.uid }
      const problemData = R.mergeAll([body, extraData]);
      if (ctx.visitor.super >= problemData.super) {
        const data: Record<string, any> = await this.service.save(problemData as T)
        const success = !body.uid ? !R.isEmpty(data) : data.matchedCount > 0
        ctx.body = packResponse({
          code: success ? 200 : 400,
          data: data,
          msg: success ? '操作成功' : '出现异常'
        })
      } else {
        ctx.body = packResponse({ code: 300, msg: '你的权限等级,不允许操作此问题集' })
      }
    } else {
      ctx.body = packResponse({ code: 300, msg: '缺少问题集信息' })
    }
  }

  // 删除操作
  public deleteMany = async (ctx: ParameterizedContext) => {
    if (!!ctx.query?.uid && typeof ctx.query.uid === 'string') {
      const uid = ctx.query.uid.split(",")
      const data = await this.service.deleteMany({ uid: { $in: uid }, super: { $lt: ctx.visitor.super } }); // 删除问题集
      return ctx.body = packResponse({
        code: data.deletedCount > 0 ? 200 : 400,
        msg: data.deletedCount > 0 ? `操作成功，删除[${data.deletedCount}]` : '未找到可删除的问题集',
        data
      })
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要删除的问题集ID' })
    }
  };

  // 更新操作
  public updateMany = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body, { "uids": "uid" }) // 请求值与查询条件的转换
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now()
      const data = await this.service.updateMany({ uid: { $in: filter.uid as string[] }, super: { $lt: ctx.visitor.super } }, R.omit(['uid'], body));
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0 ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]` : '未找到可更新的问题集',
        data
      })
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的问题集ID' })
    }
  };

  // 更新操作
  public updateOne = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body, { "uids": "uid" }) // 请求值与查询条件的转换
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now()
      const data = await this.service.updateOne({ uid: { $in: filter.uid as string[] }, super: { $lt: ctx.visitor.super } }, R.omit(['uid'], body));
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0 ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]` : '未找到可更新的问题集',
        data
      })
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的问题集ID' })
    }
  };

  // 查找操作
  public findOne = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query) // 请求值与查询条件的转换
      const data = fieldsFilter.call(await this.service.findOne(filter)); // 返回值 字段过滤
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        data: data,
        msg: !R.isEmpty(data) ? '查询成功' : '未找到相关问题集'
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  // 查找操作
  public find = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query) // 请求值与查询条件的转换
      const page = getPagination(query) // 分页参数
      const sort = getSort(query) // 排序参数
      const data = await this.service.find(filter, page, sort); // 返回值 字段过滤
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  // 聚合查询操作
  public aggregate = async (ctx: ParameterizedContext) => {
    const body: Record<string, any> = ctx.request.body;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body) // 请求值与查询条件的转换
      const page = getPagination(body) // 分页参数
      const sort = getSort(body) // 排序参数
      const data = await this.service.aggregate(filter, undefined, page, sort); // 返回值 字段过滤
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  /**
   * 根据难度等级和学龄等级获取问题集列表
   * @param ctx Koa上下文对象
   */
  public getProblemsByLevel = async (ctx: ParameterizedContext) => {
    try {
      const { difficultyLevel, gradeLevel, status = true } = ctx.request.body;
      if (!difficultyLevel || !gradeLevel) {
        ctx.body = packResponse({ code: 300, msg: '请提供难度等级和学龄等级' });
        return;
      }
      const data = await this.service.getProblemsByLevel(difficultyLevel, gradeLevel, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 根据权限等级获取问题集列表
   * @param ctx Koa上下文对象
   */
  public getProblemsBySuper = async (ctx: ParameterizedContext) => {
    try {
      const { superLevel, status = true } = ctx.request.body;
      if (!superLevel) {
        ctx.body = packResponse({ code: 300, msg: '请提供权限等级' });
        return;
      }
      const data = await this.service.getProblemsBySuper(superLevel, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 获取启用的问题集列表
   * @param ctx Koa上下文对象
   */
  public getActiveProblems = async (ctx: ParameterizedContext) => {
    try {
      const data = await this.service.getActiveProblems();
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 根据标题搜索问题集
   * @param ctx Koa上下文对象
   */
  public searchProblemsByTitle = async (ctx: ParameterizedContext) => {
    try {
      const { title, status = true } = ctx.request.body;
      if (!title) {
        ctx.body = packResponse({ code: 300, msg: '请提供搜索关键词' });
        return;
      }
      const data = await this.service.searchProblemsByTitle(title, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };
} 