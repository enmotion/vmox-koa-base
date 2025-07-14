/*
 * @Author: enmotion
 * @Date: 2025-07-02 17:22:00
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 *
 * 亮点集服务模块 - 提供基于Mongoose的亮点集CRUD操作
 * 使用泛型T扩展自IAppreciate接口，确保类型安全
 */
"use strict";
import * as R from "ramda";
import MongoDB from "mongodb";
import type { Model, MongooseUpdateQueryOptions, SaveOptions } from "mongoose";
import type { IAppreciate } from "./schema";
import { CoreService } from "src/frame-work-core/service";

export class AppreciateService<T extends IAppreciate> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model)
  }
  public override save(Appreciate:T,options?:SaveOptions):Promise<any>{
    if(!!Appreciate._id){
      return super.updateOne({_id:Appreciate._id}, Appreciate, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null);
    }else{
      return super.save(Appreciate,options)
    }
  }
} 