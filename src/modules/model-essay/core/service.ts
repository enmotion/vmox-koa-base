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
import type { Model, MongooseUpdateQueryOptions, SaveOptions } from "mongoose";
import type { IModelEssay } from "./schema";
import { CoreService } from "src/frame-work-core/service";

export class ProblemService<T extends IModelEssay> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model)
  }
  public override async save(modelEssay:T,options?:SaveOptions):Promise<any>{
    if(!!modelEssay._id){
      await super.updateOne({_id:modelEssay._id}, modelEssay, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null);
      return super.findOne({_id:modelEssay._id},{})
    }else{
      return super.save(modelEssay,options)
    }
  }
} 