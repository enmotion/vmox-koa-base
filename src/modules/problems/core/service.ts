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
import type { IProblem } from "./schema";
import { CoreService } from "src/frame-work-core/service";

export class ProblemService<T extends IProblem> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model)
  }

  /**
   * 保存或更新问题集数据
   * @param problem 问题集数据
   * @param options 保存选项
   * @returns 保存或更新结果
   */
  public override save(problem: T, options?: SaveOptions): Promise<any> {
    if (!!problem._id) {
      return super.updateOne({ _id: problem._id }, problem, options as (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>) | null);
    } else {
      return super.save(problem, options)
    }
  }

  /**
   * 根据难度等级和学龄等级获取问题集列表
   * @param difficultyLevel 难度等级
   * @param gradeLevel 学龄等级
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getProblemsByLevel(difficultyLevel: number, gradeLevel: number, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      difficultyLevel,
      gradeLevel,
      status
    });
  }

  /**
   * 根据权限等级获取问题集列表
   * @param superLevel 权限等级
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getProblemsBySuper(superLevel: number, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      super: { $lte: superLevel },
      status
    });
  }

  /**
   * 获取启用的问题集列表
   * @returns 启用的问题集列表
   */
  public async getActiveProblems(): Promise<{ items: T[]; total: number }> {
    return await this.find({ status: true });
  }

  /**
   * 根据标题搜索问题集
   * @param title 问题标题关键词
   * @param status 状态筛选
   * @returns 匹配的问题集列表
   */
  public async searchProblemsByTitle(title: string, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      title: { $regex: title, $options: 'i' },
      status
    });
  }
} 