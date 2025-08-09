/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:55:04
 * 
 * 用户服务模块 - 提供基于Mongoose的用户CRUD操作
 * 使用泛型T扩展自IClient接口，确保类型安全
 */
'use strict';
import * as R from "ramda";
import { mongoDBErrorTransform } from "@lib/serviceTools";
import { ClientService} from "../core/service";
import type { Model } from "mongoose";
import type { ExpandClient } from "./schema";

/**
 * 用户服务工厂函数
 * @param model Mongoose用户模型
 * @returns 包含CRUD操作方法的对象
 */
export class ExpandClientService<T extends ExpandClient> extends ClientService<T>{
  public constructor(model:Model<T>){
    super(model as Model<T>)
  }
}