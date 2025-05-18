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
import { mongoDBErrorTransform } from "@lib/serviceTools";
import type { Model } from "mongoose";
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
  public remove = async (user: T) => {
    try {
      const data = await this.model.deleteMany({ uid: user.uid });
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
  public update = async (user: T) => {
    try {
      const data = await this.model.updateOne(
        { uid: user.uid },
        { $set: user },
        { runValidators: true }
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
  public search = async (user: T, onlyOne:boolean = true) => {
    try {
      const data = await this.model.findOne(user);
      return data;
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema);
    }
  };
}
