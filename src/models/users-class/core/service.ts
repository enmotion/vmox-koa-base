/*
 * @Author: enmotion
 * @Date: 2025-04-29 08:50:46
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 00:01:42
 *
 * 用户服务模块 - 提供基于Mongoose的用户CRUD操作
 * 使用泛型T扩展自IUser接口，确保类型安全
 */
"use strict";
import * as R from "ramda";
import MongoDB from "mongodb";
import type { Model, MongooseUpdateQueryOptions, SaveOptions } from "mongoose";
import type { IUser } from "./schema";
import { CoreService } from "src/frame-work-core/service";

export class UserService<T extends IUser> extends CoreService<T>{
  // public model: Model<T>;
  public constructor(model: Model<T>) {
    super(model)
  }
  public override save(user:T,options?:SaveOptions):Promise<any>{
    if(!!user.uid){
      return super.updateOne({uid:user.uid},user, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null);
    }else{
      return super.save(user,options)
    }
  }
}
