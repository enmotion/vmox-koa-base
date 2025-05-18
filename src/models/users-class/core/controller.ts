/*
 * 用户控制器模块 - 处理用户相关HTTP请求
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";  // 函数式编程工具库
import { ParameterizedContext } from "koa";  // Koa上下文类型
import { UserService } from "./service";  // 用户服务层
import type { IUser } from "./schema";  // 用户模型接口

import * as JWT from "jsonwebtoken";  // JWT令牌生成
import { Schema } from "mongoose";  // Mongoose模式类型
import { packResponse, fieldsFilter, conditionMappingToField } from "@lib/serviceTools";  // 响应处理工具

/**
 * 用户控制器类
 * @template T 扩展自IUser的泛型类型
 */
export class UserControllers<T extends IUser> {
  public service: UserService<T>;  // 用户服务实例
  public schema: Schema<T>;  // Mongoose模式实例

  /**
   * 构造函数
   * @param service 注入的用户服务
   * @param schema 用户数据模式
   */
  public constructor(service: UserService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }

  /**
   * 用户注册方法
   * @param ctx Koa上下文对象
   * @throws 抛出数据库操作异常
   */
  public register = async (ctx: ParameterizedContext) => {
    try {
      // 创建用户数据并过滤返回值
      const body = conditionMappingToField(ctx.request?.body??{}) // 请求值与查询条件的转换
      const data = fieldsFilter.call(
        await this.service.create(body as any)
      );
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
   * 用户登录方法
   * @param ctx Koa上下文对象
   * @returns 包含JWT令牌的响应
   */
  public login = async (ctx: ParameterizedContext) => {
    try {
      const queryData = R.pick(
        ["username", "password"],
        R.mergeAll([{ username: null, password: null }, ctx.request.body ?? {}])
      );
      const body = conditionMappingToField(queryData??{}) // 请求值与条件的转换
      const data = fieldsFilter.call(
        await this.service.find(body as any)
      );
      if (!!data) {
        const token = JWT.sign(
          R.pick(["username", "uid"], data),
          process.env.APP_JWT_KEY as string,
          { expiresIn: "24h" }
        );
        ctx.body = packResponse({
          data: R.mergeDeepRight(data, { token }),
          msg: `欢迎回来 ${data.nickname ?? data.username}`,
        });
      } else {
        ctx.body = packResponse({
          code: 400,
          data: null,
          msg: "用户名或密码,缺失或错误",
        });
      }
    } catch (err: any) {
      throw err;
    }
  };
  
  // 以下为基本CRUD操作方法
  public create = async (ctx: ParameterizedContext) => {
    try {
      const body = R.mergeAll([
        ctx.request?.body ?? {},
        { createUser: ctx.token.uid, createType: "admin" },
      ]);
      const data = fieldsFilter.call(await this.service.create(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };
  // 删除操作
  public delete = async (ctx: ParameterizedContext) => {
    if(!!ctx.query?.uid && typeof ctx.query.uid === 'string'){
      const uid  = ctx.query.uid.split(",")
      const data = await this.service.remove({uid:{$in:uid}})
      return ctx.body = packResponse({ code:data.deletedCount > 0 ? 200:400, msg:data.deletedCount>0 ? `删除操作成功，删除数量${data.deletedCount}` : '未找到可删除的用户', data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };
  // 更新操作
  public updateMany = async (ctx: ParameterizedContext) => {
    const body = ctx.request?.body as Record<string,any>
    if(!R.isNil(body) && !R.isEmpty(body)){
      const filter = conditionMappingToField(body,{"uids":"uid"}) // 请求值与查询条件的转换
      const data = await this.service.update({uid:{$in:filter.uid as string[]}},R.omit(['uid'],filter));
      ctx.body = packResponse({ code:data.matchedCount > 0 ? 200:400, msg:data.matchedCount > 0 ? `更新操作成功，更新数量${data.matchedCount}` : '未找到可更新的用户', data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };
  // 更新操作
  public updateOne = async (ctx: ParameterizedContext) => {
    const body = ctx.request?.body as Record<string,any>
    if(!R.isNil(body) && !R.isEmpty(body)){
      const filter = conditionMappingToField(body,{"uids":"uid"}) // 请求值与查询条件的转换
      const data = await this.service.updateOne({uid:{$in:filter.uid as string[]}},R.omit(['uid'],filter));
      ctx.body = packResponse({ code:data.matchedCount > 0 ? 200:400, msg:data.matchedCount > 0 ? `更新操作成功，更新数量${data.matchedCount}` : '未找到可更新的用户', data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };
  // 查找操作
  public find = async (ctx: ParameterizedContext) => {
    const query:Record<string,any> = ctx.query;
    if(!R.isNil(query) && !R.isEmpty(query)){
      const filter = conditionMappingToField(query) // 请求值与查询条件的转换
      const data = await this.service.find(filter);
      ctx.body = packResponse({code:!R.isNil(data)? 200 : 400, msg:!R.isNil(data)?'操作成功':'请提供需要删除的用户ID',data:fieldsFilter.call(data)})
    }else{
      ctx.body = packResponse({
        code:400,
        msg:'未设置查询条件',
        data:{}
      })
    }
  };
  // 分页查找操作
  public page = async (ctx: ParameterizedContext) => {
    const query = ctx.query;
    if(!R.isNil(query) && !R.isEmpty(query)){
      const data = await this.service.search(query as any,);
      ctx.body = packResponse({code:!R.isEmpty(data)? 200 : 400, msg:!R.isEmpty(data)?'操作成功':'请提供需要删除的用户ID',data:fieldsFilter.call(data)})
    }else{
      ctx.body = packResponse({
        code:400,
        msg:'未设置查询条件',
        data:{}
      })
    }
  };
}
