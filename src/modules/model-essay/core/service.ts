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
import colors from "colors";
import { getEmbedding } from "src/sdk/dashscope"; // 引入百炼词嵌入模型
import type { Model, MongooseUpdateQueryOptions, SaveOptions, RootFilterQuery, MongooseBaseQueryOptions } from "mongoose";
import type { IModelEssay } from "./schema";
import { CoreService } from "src/frame-work-core/service";
import { qdrantClient } from "src/database";

export class ModelEssayService<T extends IModelEssay> extends CoreService<T> {
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
    let saveItem = R.clone(modelEssay) as Record<string,any>
    const currentItem = JSON.parse(JSON.stringify(await super.findOne({uuid:saveItem.uuid??''}))) ; // 考虑到这次或许只是部分更新某个向量属性，因此要做重新的合并
    // 更新操作必须确保存在当前数据，不存在数据时，不能进行更新操作
    if(!!currentItem?.uuid){
      // 只要更新中，携带了新的需要向量的属性，则会重新获取向量值
      if(R.values(R.pick(['title','content','vectorKeyWords'],saveItem)).filter((item:string)=>!!item).length>0){
        // 注意点: 出现过存储异常问题， mergeAll操作 ，返回的数据与想象的不一致，会添加一些内容，所以不能直接赋值给 saveItem
        saveItem = R.mergeAll([currentItem as Record<string,any>, saveItem]); // 确保数据的完整性 将当前存储数据合并为全量数据
        saveItem.vector = await getEmbedding(`${saveItem?.title??''}#${saveItem?.vectorKeyWords?.join?.("#")??''}#${saveItem?.content??''}`) // 获取文本向量 标题 + 正文
      }
      await super.updateOne({uuid:saveItem.uuid}, saveItem, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null);
      const vectorPoint = {
        id: saveItem.uuid, // 使用UUID作为默认ID
        vector: saveItem.vector,
        payload: R.pick(['title','content','genre','writingMethods','appreciationGuide','from','status','sync','vectorKeyWords'], saveItem) // 去除向量字段
      } as any;
      await qdrantClient.upsert(process.env.APP_QDRANT_MODEL_ESSAY_DB_NAME as string, { points:[vectorPoint], wait:true }); // 向Qdrant中插入或更新向量点
      return saveItem
    }else{
      const data = await super.save(modelEssay,options)
      try{
        data.vector = await getEmbedding(`${data?.title??''}#${data?.vectorKeyWords?.join?.(",")??''}#${data?.content??''}`) // 获取文本向量 标题 + 正文    
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