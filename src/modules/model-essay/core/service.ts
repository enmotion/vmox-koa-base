/*
 * @Author: enmotion
 * @Date: 2025-07-02 17:22:00
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 *
 * 问题集服务模块 - 提供基于Mongoose的问题集CRUD操作
 * 使用泛型T扩展自IProblem接口，确保类型安全
 */
"use strict";
import * as R from "ramda";
import MongoDB from "mongodb";
import type { Model, MongooseUpdateQueryOptions, SaveOptions, RootFilterQuery, MongooseBaseQueryOptions } from "mongoose";
import type { IModelEssay } from "./schema";
import { CoreService } from "src/frame-work-core/service";
import { qdrantClient } from "src/database";

export class ProblemService<T extends IModelEssay> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model)
  }
  public override async updateMany(
    filter:RootFilterQuery<T>,
    update: Record<string, any>,
    updateIds:(number|string)[],
    options?: (MongoDB.DeleteOptions & MongooseBaseQueryOptions<T>) | null,
  ):Promise<any>{
    const data = await super.updateMany(filter, update, options)
    await qdrantClient.setPayload(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string,{
      points:updateIds,
      payload:R.omit(['uuids'], update)
    })
    return data
  }
  public override async deleteMany(
    filter:RootFilterQuery<T>, 
    deleteIds:(number|string)[],
    options?: (MongoDB.DeleteOptions & MongooseBaseQueryOptions<T>) | null,
  ):Promise<any>{
    const data = await super.deleteMany(filter, options)
    await qdrantClient.delete(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string,{points:deleteIds})
    return data
  }
  public override async save(modelEssay:T,options?:SaveOptions):Promise<any>{
    if(!!modelEssay.uuid){
      await super.updateOne({uuid:modelEssay.uuid}, modelEssay, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null);
      const data = await super.findOne({uuid:modelEssay.uuid},{})
      if(data){
        const vectorPoint = {
          id: data.uuid, // 使用UUID作为默认ID
          vector: data.vector,
          payload: R.pick(['title','content','genre','writingMethods','appreciationGuide','from','status','sync'], data) // 去除向量字段
        } as any;
        await qdrantClient.upsert(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string, { points:[vectorPoint], wait:true }); // 向Qdrant中插入或更新向量点
        return data
      }
    }else{
      const data = await super.save(modelEssay,options)
      try{
        // 创建向量数据
        const vectorPoint = {
          id: data.uuid, // 使用UUID作为默认ID
          vector: data.vector,
          payload: R.pick(['title','content','genre','writingMethods','appreciationGuide','from','status','sync'], data) // 去除向量字段
        } as any;
        await qdrantClient.upsert(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string, { points:[vectorPoint], wait:true }); // 向Qdrant中插入或更新向量点
        return data
      }catch(err){
        super.deleteMany({uuid:data.uuid})
        throw err
      }
    }
  }
} 