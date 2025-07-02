/*
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 * 
 * 问题集扩展服务模块 - 提供基于Mongoose的问题集扩展CRUD操作
 * 使用泛型T扩展自ExpandProblem接口，确保类型安全
 */
'use strict';
import * as R from "ramda";
import { mongoDBErrorTransform } from "@lib/serviceTools";
import { ProblemService } from "../core/service";
import type { Model } from "mongoose";
import type { ExpandProblem } from "./schema";

/**
 * 问题集扩展服务类
 * @template T 扩展自ExpandProblem的泛型类型
 */
export class ExpandProblemService<T extends ExpandProblem> extends ProblemService<T> {
  public constructor(model: Model<T>) {
    super(model as Model<T>)
  }

  /**
   * 根据分类获取问题集列表
   * @param category 问题分类
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getProblemsByCategory(category: string, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      category,
      status
    });
  }

  /**
   * 根据标签获取问题集列表
   * @param tags 标签数组
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getProblemsByTags(tags: string[], status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      tags: { $in: tags },
      status
    });
  }

  /**
   * 根据优先级获取问题集列表
   * @param priority 优先级
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getProblemsByPriority(priority: number, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      priority,
      status
    });
  }

  /**
   * 获取高优先级问题集列表
   * @param minPriority 最小优先级
   * @param status 状态筛选
   * @returns 问题集列表
   */
  public async getHighPriorityProblems(minPriority: number = 7, status: boolean = true): Promise<{ items: T[]; total: number }> {
    return await this.find({
      priority: { $gte: minPriority },
      status
    });
  }
} 