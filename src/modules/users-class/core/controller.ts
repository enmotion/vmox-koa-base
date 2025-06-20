/*
 * 用户控制器模块 - 处理用户相关HTTP请求
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 00:14:18
 */

"use strict";
import * as R from "ramda";  // 函数式编程工具库
import { ParameterizedContext } from "koa";  // Koa上下文类型
import { UserService } from "./service";  // 用户服务层
import type { IUser } from "./schema";  // 用户模型接口
import { getPagination, getSort } from "@lib/serviceTools";
import * as JWT from "jsonwebtoken";  // JWT令牌生成
import { Schema, RootFilterQuery } from "mongoose";  // Mongoose模式类型
import { packResponse, fieldsFilter, getFilter } from "@lib/serviceTools";  // 响应处理工具
import koaBody from "koa-body";

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
      const body = getFilter(ctx.request?.body??{}) // 请求值与查询条件的转换
      const data = fieldsFilter.call(
        await this.service.save(body as any,)
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
      // 通过账号或昵称 匹配密码找到用户
      const filter = getFilter(
        queryData,
        {
          "username":['$or',(value:any)=>([
            {username:value},
            {nickname:value}
          ])]
        },
      ) // 请求值与条件的转换
      console.log(filter)
      const data:any = await this.service.findOne(filter as any,undefined,{lean:true})
      if (!!data && !!data.status) {
        data.loginCount ++ // 登录次数递增
        await this.service.updateOne({uid:data.uid},{loginCount:data.loginCount},{timestamps:false})
        const token = JWT.sign(
          R.pick(["username", "uid","loginCount",'powVersion'], data),
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
          msg: (R.isEmpty(data) || R.isNil(data)) ? "用户名或密码,缺失错误" : "该用户已被禁用",
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
        { createdUser: ctx.visitor.uid, createdType: "admin" },
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any)); // 返回值 字段过滤
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };
  // 删除操作
  public deleteMany = async (ctx: ParameterizedContext) => {
    if(!!ctx.query?.uid && typeof ctx.query.uid === 'string'){
      const uid  = ctx.query.uid.split(",")
      const data = await this.service.deleteMany({uid:{$in:uid},super:{$lt:ctx.visitor.super}}); // 删除用户
      return ctx.body = packResponse({ 
        code:data.deletedCount > 0 ? 200:400, 
        msg:data.deletedCount>0 ? `操作成功，删除[${data.deletedCount}]` : '未找到可删除的用户', 
        data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };
  // 更新操作
  public updateMany = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string,any>
    if(!R.isNil(body) && !R.isEmpty(body)){
      const filter = getFilter(body,{"uids":"uid"}) // 请求值与查询条件的转换
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now()
      const data = await this.service.updateMany({uid:{$in:filter.uid as string[]},super:{$lt:ctx.visitor.super}},R.omit(['uid'],body));
      ctx.body = packResponse({ 
        code:data.matchedCount > 0 ? 200:400, 
        msg:data.matchedCount > 0 ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]` : '未找到可更新的用户', 
        data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };
  // 更新操作
  public updateOne = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string,any>
    if(!R.isNil(body) && !R.isEmpty(body)){
      const filter = getFilter(body,{"uids":"uid"}) // 请求值与查询条件的转换
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now()
      const data = await this.service.updateOne({uid:{$in:filter.uid as string[]},super:{$lt:ctx.visitor.super}},R.omit(['uid'],body));
      ctx.body = packResponse({ 
        code:data.matchedCount > 0 ? 200:400, 
        msg:data.matchedCount > 0 ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]` : '未找到可更新的用户', 
        data})
    }else{
      ctx.body = packResponse({code:300,msg:'请提供需要删除的用户ID'})
    }
  };

  public save = async (ctx:ParameterizedContext)=>{
    const body:Record<string,any> = ctx.request.body;
    if(!R.isNil(body) && !R.isEmpty(body)){
      const extraData = !body?.uid ? { createdUser:ctx.visitor.uid, createdType:'admin'} : {updatedUser:ctx.visitor.uid}
      const userData = R.mergeAll([body,extraData]);
      if(ctx.visitor.super >= userData.super || ctx.visitor.uid == userData.uid){
        const data:Record<string,any> = await this.service.save(userData as T)
        const success = !body.uid ? !R.isEmpty(data) : data.matchedCount > 0
        ctx.body = packResponse({
          code:success ? 200:400,
          data:data,
          msg:success ? '操作成功' : '出现异常'
        })
      }else{
        ctx.body = packResponse({code:300,msg:'你的权限等级,不允许操作此用户'})  
      }
    }else{
      ctx.body = packResponse({code:300,msg:'缺少用户信息'})
    }
  }
  // 查找操作
  public findOne = async (ctx: ParameterizedContext) => {
    const query:Record<string,any> = ctx.query;
    if(!R.isNil(query) && !R.isEmpty(query)){
      const filter = getFilter(query) // 请求值与查询条件的转换
      const data = fieldsFilter.call(await this.service.findOne(filter)); // 返回值 字段过滤
      ctx.body = packResponse({
        code:!R.isNil(data)? 200 : 400, 
        msg:!R.isNil(data)?'操作成功':'请提供需要删除的用户ID',
        data
      }) 
    }else{
      ctx.body = packResponse({
        code:400,
        msg:'未设置查询条件',
        data:{}
      })
    }
  };
  // 分页查找操作
  public find = async (ctx: ParameterizedContext) => {
    const query:Record<string,any> = ctx.request.body??{};
    const filter = getFilter(
      R.omit(['page','sort'],query),
      {
        "username":"username.$regex",
        "nickname":"nickname.$regex",
        "uid":"uid.$regex",
      }
    ) as RootFilterQuery<T>// 请求值与查询条件的转换
    const page = getPagination(query.page) // 分页与排序转换
    const sort = getSort(query.sort) // 分页与排序转换
    // 查询模式下，超级管理员在列表中不可见
    const data = await this.service.find(R.mergeAll([filter,{super:{$eq:0}}]), page, sort,{password:0} );

    ctx.body = packResponse({
      code:!R.isEmpty(data.items)? 200 : 400, 
      msg:!R.isEmpty(data.items)?'操作成功':'未找到符合条件的用户',
      data
    })
  };

  public aggregate = async (ctx: ParameterizedContext)=>{
    const visitor = ctx.visitor;
    const query:Record<string,any> = ctx.request.body??{};
    const filter = getFilter(
      R.omit(['page','sort'],query),
      {
        "username":"username/$regex",
        "nickname":["nickname",(value)=>{ return {$regex:value, $options:'i'}}],
        "uid":"uid.$regex",
        "createdAt":"createdAt/$dateRange",
        "updatedAt":"updatedAt/$dateRange"
      }
    ) as RootFilterQuery<T>// 请求值与查询条件的转换
    const page = getPagination(query.page) // 分页与排序转换
    const sort = getSort(query.sort) // 分页与排序转换
    // 查询模式下，超级管理员在列表中不可见
    const data = await this.service.aggregate(R.mergeAll([filter,{super:{$lte:visitor.super}}]), { password:0,_id:0,__v:0 }, page, sort, [
      {
        $lookup:{
          from:this.service.model.collection.name,
          localField: 'createdUser', 
          foreignField: 'uid',    // 目标集合的关联字段
          as: 'createdUserInfo',       // 存储匹配结果的临时字段
          pipeline:[
            {$project:{username:1,nickname:1}}
          ]
        },
      },
      { 
        $unwind: {
          path: '$createdUserInfo',
          preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
        } 
      },
      {
        $lookup:{
          from:this.service.model.collection.name,
          localField: 'updatedUser', 
          foreignField: 'uid',    // 目标集合的关联字段
          as: 'updatedUserInfo',       // 存储匹配结果的临时字段
          pipeline:[
            {$project:{username:1,nickname:1}}
          ]
        },
      },
      { 
        $unwind: {
          path: '$updatedUserInfo',
          preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
        } 
      },
      // {
      //   $addFields: {
      //     createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
      //   }
      // },      
    ])
    ctx.body = packResponse({
      code:!R.isEmpty(data[0].items)? 200 : 400, 
      msg:!R.isEmpty(data[0].items)?'操作成功':'未找到符合条件的用户',
      data:data[0]
    })
  }
  public uniqValidate = async (ctx: ParameterizedContext)=>{
    const query:Record<string,any> = ctx.request.body??{};
    const filter = getFilter(
      R.omit(['page','sort'],query),
      {
        "uid":"uid/$not/$eq"
      }
    ) as RootFilterQuery<T>// 请求值与查询条件的转换
    // 查询模式下，超级管理员在列表中不可见
    const data = await this.service.aggregate(filter, { password:0,_id:0,__v:0 }, null, null, [
      {
        $lookup:{
          from:this.service.model.collection.name,
          localField: 'createdUser', 
          foreignField: 'uid',    // 目标集合的关联字段
          as: 'createdUserInfo',       // 存储匹配结果的临时字段
          pipeline:[
            {$project:{username:1,nickname:1}}
          ]
        },
      },
      { 
        $unwind: {
          path: '$createdUserInfo',
          preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
        } 
      },
      {
        $lookup:{
          from:this.service.model.collection.name,
          localField: 'updatedUser', 
          foreignField: 'uid',    // 目标集合的关联字段
          as: 'updatedUserInfo',       // 存储匹配结果的临时字段
          pipeline:[
            {$project:{username:1,nickname:1}}
          ]
        },
      },
      { 
        $unwind: {
          path: '$updatedUserInfo',
          preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
        } 
      },
      // {
      //   $addFields: {
      //     createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
      //   }
      // },      
    ])
    ctx.body = packResponse({
      code:!R.isEmpty(data[0].items)? 200 : 400, 
      msg:!R.isEmpty(data[0].items)?'操作成功':'未找到符合条件的用户',
      data:data[0]
    })
  }
}
