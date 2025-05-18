/*
 * @Author: enmotion
 * @Date: 2025-04-29 08:50:46
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:55:04
 *
 * 用户服务模块 - 提供基于Mongoose的用户CRUD操作
 * 使用泛型T扩展自IUser接口，确保类型安全
 */
"use strict";
import * as R from "ramda";
import MongoDB from "mongodb";
import { getPaginationAndSort, mongoDBErrorTransform, Pagination } from "@lib/serviceTools";
import type { Model, RootFilterQuery, MongooseUpdateQueryOptions } from "mongoose";
import type { IUser } from "./schema";
export class UserService<T extends IUser> {
  public model: Model<T>;
  public constructor(model: Model<T>) {
    this.model = model;
  }
  /**
   * 创建用户
   * @param user 用户数据对象
   * @returns 创建的文档
   */
  public create = async (user: T) => {
    try {
      const data = this.model && (await new this.model(user).save());
      return data;
    } catch (err) {
      // 转换MongoDB错误为业务可读错误
      throw mongoDBErrorTransform(err, this.model?.schema);
    }
  };

  /**
   * 删除用户(根据uid删除多个匹配文档)
   * @param user 包含uid的用户对象
   * @returns 删除结果
   */
  public deleteMany = async (filter:RootFilterQuery<T>) => {
    try {
      const data = await this.model.deleteMany(filter);
      return data;
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };

  /**
   * 更新用户(根据uid更新单个文档)
   * @param user 包含uid和更新字段的用户对象
   * @returns 更新结果
   */
  public updateMany = async (filter:RootFilterQuery<T>, update:Record<string,any>, operation?:(MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null) => {
    try {
      const data = await this.model.updateMany(
        filter,
        { $set: update },
        operation
      );
      return data;
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };

  /**
   * 更新用户(根据uid更新单个文档)
   * @param user 包含uid和更新字段的用户对象
   * @returns 更新结果
   */
  public updateOne = async (filter:RootFilterQuery<T>, update:Record<string,any>, operation?:(MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>)|null) => {
    try {
      const data = await this.model.updateOne(
        filter,
        update,
        operation
      );
      return data;
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };
  /**
   * 查找单个用户(返回第一个匹配文档)
   * @param user 查询条件对象
   * @returns 用户文档或null
   */
  public findOne = async (filter:RootFilterQuery<T>) => {
    try {
      const data = await this.model.findOne(filter)
      return data;
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };
  /**
   * 查找单个用户(返回第一个匹配文档)
   * @param user 查询条件对象
   * @returns 用户文档或null
   */
  public find = async (filter:RootFilterQuery<T>, page:{size:number,current:number}|false, sort:Record<string,-1|1|'desc'|'asc'> ) => {
    try {
      const items = !!page ? await this.model.find(filter).sort(sort).skip((page?.size??0) * (page?.current??0)).limit(page?.size??10) : await this.model.find(filter).sort(sort)
      const total = await this.model.countDocuments(filter)
      return {
        items:items,
        total:total,
      };
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };
}
