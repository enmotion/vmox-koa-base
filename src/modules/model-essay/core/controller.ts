/*
 * 范文控制器模块 - 处理范文相关HTTP请求
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 */

"use strict";
import * as colors from "colors";
import * as R from "ramda";  // 函数式编程工具库
import { mongoose } from "src/database";
import { v4 } from "uuid"
import { getEmbedding } from "src/sdk/dashscope"; // 引入百炼词嵌入模型
import { ParameterizedContext } from "koa";  // Koa上下文类型
import { ModelEssayService } from "./service";  // 范文服务层
import type { IModelEssay } from "./schema";  // 范文模型接口
import { getPagination, getSort } from "@lib/serviceTools";
import { Schema, RootFilterQuery } from "mongoose";  // Mongoose模式类型
import { packResponse, fieldsFilter, getMongooseQueryFilter, getQdrantFilter } from "@lib/serviceTools";  // 响应处理工具
import { qdrantClient } from "src/database";

/**
 * 范文控制器类
 * @template T 扩展自IProblem的泛型类型
 */
const aggregatePiple=[
  {
    $lookup: {
      from: "tags",
      localField: 'genre',
      foreignField: 'key',    // 目标集合的关联字段
      as: 'generInfo',       // 存储匹配结果的临时字段
      pipeline: [
        { $project: { name: 1 } }
      ]
    },
  },
  {
    $lookup: {
      from: "tags",
      localField: 'writingMethods',
      foreignField: 'key',    // 目标集合的关联字段
      as: 'writingMethodsInfo',       // 存储匹配结果的临时字段
      pipeline: [
        { $project: { name: 1} }
      ]
    },
  },
  {
    $lookup: {
      from: "tags",
      localField: 'sync',
      foreignField: 'key',    // 目标集合的关联字段
      as: 'syncInfo',       // 存储匹配结果的临时字段
      pipeline: [
        { $project: { name: 1} }
      ]
    },
  },
  {
    $lookup: {
      from: "user-collections",
      localField: 'createdUser',
      foreignField: 'uid',    // 目标集合的关联字段
      as: 'createdUserInfo',       // 存储匹配结果的临时字段
      pipeline: [
        { $project: { username: 1, nickname: 1 } }
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
    $lookup: {
      from: "user-collections",
      localField: 'updatedUser',
      foreignField: 'uid',    // 目标集合的关联字段
      as: 'updatedUserInfo',       // 存储匹配结果的临时字段
      pipeline: [
        { $project: { username: 1, nickname: 1 } }
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
]
export class ModelControllers<T extends IModelEssay> {
  public service: ModelEssayService<T>;  // 范文服务实例
  public schema: Schema<T>;  // Mongoose模式实例

  /**
   * 构造函数
   * @param service 注入的范文服务
   * @param schema 范文数据模式
   */
  public constructor(service: ModelEssayService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }
  /**
   * 保存或更新范文方法
   * @param ctx Koa上下文对象
   * @returns 保存或更新结果
   */
  public save = async (ctx: ParameterizedContext) => {
    // const session = await mongoose.startSession(); // 创建事务机制的 session
    const body: Record<string, any> = ctx.request.body;
    if (!R.isNil(body) && !R.isEmpty(body)) {      
      if (!body.super || ctx.visitor.super >= body.super) {
        // session.startTransaction(); // 事务机制开始
        const extraData:Record<string,any> = !body?.uuid ? { createdUser: ctx.visitor.uid } : { updatedUser: ctx.visitor.uid }
        const modelEssayData = R.mergeAll([body, extraData]); // 合并请求数据，在原始数据上添加 向量值与更新或者创建内容
        modelEssayData.super = modelEssayData.super ?? ctx?.visitor?.super ?? 0
        // modelEssayData.vector = await getEmbedding(body.title+'#'+body.content) // 更改为 service 内部获取向量值
        console.log('save....')
        const data: Record<string, any> = await this.service.save(modelEssayData as T,{})
        ctx.body = packResponse({
          code: 200,
          data: data,
          msg: '操作成功'
        })
      } else {
        ctx.body = packResponse({ code: 300, msg: '你的权限等级,不允许操作此范文' })
      }
    } else {
      ctx.body = packResponse({ code: 300, msg: '缺少范文信息' })
    }
  }

  // 删除操作
  public deleteMany = async (ctx: ParameterizedContext) => {
    if (!!ctx.query?.uuids && typeof ctx.query.uuids === 'string') {
      const uuids = ctx.query.uuids.split(",")
      console.log(uuids)
      const deleteDatas = await this.service.find({uuid: { $in: uuids }, super: { $lte: ctx.visitor.super }}) // 查找符合条件的所有集合
      const deleteIds = deleteDatas.items.map(item=>item.uuid);
      const data = await this.service.deleteMany({ uuid: { $in: deleteIds } }, deleteIds); // 删除范文
      return ctx.body = packResponse({
        code: data.deletedCount > 0 ? 200 : 400,
        msg: data.deletedCount > 0 ? `操作成功，删除[${data.deletedCount}]` : '未找到可删除的范文',
        data
      })
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要删除的范文ID' })
    }
  };

  // 更新操作
  public updateMany = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>
    console.log(body, 'updateMany')
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(body, { "uuids": "uuids" }) // 请求值与查询条件的转换
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now()
      const updateDatas = await this.service.find({uuid: { $in: filter.uuids }, super: { $lte: ctx.visitor.super }}) // 查找符合条件的所有集合
      const updateIds = updateDatas.items.map(item=>item.uuid);
      const data = await this.service.updateMany({ uuid: { $in: updateIds } }, R.omit(['uuids'], body),updateIds);
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0 ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]` : '未找到可更新的范文',
        data
      })
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的范文ID' })
    }
  };

  // 查找操作
  public findOne = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getMongooseQueryFilter(query) // 请求值与查询条件的转换
      const data = fieldsFilter.call(await this.service.findOne(filter)); // 返回值 字段过滤
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        data: data,
        msg: !R.isEmpty(data) ? '查询成功' : '未找到相关范文'
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
  // 聚合查询操作
  public aggregate = async (ctx: ParameterizedContext) => {
    const body: Record<string, any> = !R.isEmpty(ctx.request.body) ? ctx.request.body : JSON.parse(JSON.stringify(ctx.query)) ?? {};
    // https://rr4426xx0138.vicp.fun/problems/pub/find
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(
        R.omit(['page', 'sort'], body),
        {
          "title": "title/$regex",
          "genre": "genre",
          "writingMethods": "writingMethods/$in",
          "sync": "sync/$in",
          "createdAt": "createdAt/$dateRange",
          "updatedAt": "updatedAt/$dateRange"
        }
      ) // 请求值与查询条件的转换
      const page = getPagination(body.page) // 分页参数
      const sort = getSort(body.sort) // 排序参数
      const data = await this.service.aggregate(filter, { __v: 0 }, page, sort, aggregatePiple); // 返回值 字段过滤
      ctx.body = packResponse({
        code: 200,
        data: data[0],
        msg: '查询成功'
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
  // 向量查询接口
  public vectorSearch = async (ctx: ParameterizedContext) => {
    if(R.isEmpty(ctx.request.body)){
      ctx.body = packResponse({
        code: 400,
        data: {},
        msg: '请输入查询条件' 
      });
      return
    }
    const request = R.clone(ctx.request.body) as Record<string, any>;
    const must = getQdrantFilter(R.omit(['query'],request),{
      status:{target:'status',match:'match/value'},
      genre:{target:'genre',match:'match/any'},
      writingMethods:{target:"writingMethods",match:"match/any"},
      sync:{target:'sync',match:'match/any'},
      
    })
    if(!!request.query){
      request.query = await getEmbedding(request.query) // 获取文本向量
      const vectorDatas = await qdrantClient.query(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string, {
        query:request.query,      
        filter:{
          must:must
        },
        limit:20,
        with_payload:{
          include:['id']
        },
        with_vector:false,
      })
      const data = await this.service.aggregate(
        {uuid:{$in:vectorDatas.points.map(item=>item.id)}},
        {__v:0,vector:0},null,null,
        aggregatePiple,
      )
      const items = vectorDatas.points.map(point=>{
        return R.mergeAll([data[0].items.find((item:Record<string,any>)=>point.id == item.uuid),{score:point.score}])
      })
       console.log(vectorDatas)
      // console.log(data, 'vectorSearch')
      ctx.body = packResponse({
        code: 200,
        data: {
          total:items.length,
          items:items
        },
        msg: '查找成功' 
      });
    }else{
      const vectorDatas = await qdrantClient.query(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string, { 
        filter:{
          must:must
        },
        limit:20,
        with_payload:{
          include:['id']
        },
        with_vector:false,
      })
      const data = await this.service.aggregate(
        {uuid:{$in:vectorDatas.points.map(item=>item.id)}},
        {__v:0, vector:0},null,null,
        aggregatePiple,
      )
      const items = vectorDatas.points.map(point=>{
        return data[0].items.find((item:Record<string,any>)=>point.id == item.uuid)
      })
      // console.log(data, 'vectorSearch')
      ctx.body = packResponse({
        code: 200,
        data: {
          total:items.length,
          items:items
        },
        msg: '查找成功' 
      });
    }
  }
} 