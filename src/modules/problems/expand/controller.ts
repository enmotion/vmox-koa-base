/*
 * @Author: enmotion
 * @Date: 2025-07-02 17:22:00
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { ProblemControllers } from "../core/controller";
import { ExpandProblemService } from "./service";
import type { ExpandProblem } from "./schema";
import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandProblemControllers<T extends ExpandProblem> extends ProblemControllers<T> {
  public constructor(service: ExpandProblemService<T>, schema: Schema<T>) {
    super(service, schema)
  }

  /**
   * 根据分类获取问题集列表
   * @param ctx Koa上下文对象
   */
  public getProblemsByCategory = async (ctx: ParameterizedContext) => {
    try {
      const { category, status = true } = ctx.request.body;
      if (!category) {
        ctx.body = packResponse({ code: 300, msg: '请提供问题分类' });
        return;
      }
      const data = await (this.service as ExpandProblemService<T>).getProblemsByCategory(category, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 根据标签获取问题集列表
   * @param ctx Koa上下文对象
   */
  public getProblemsByTags = async (ctx: ParameterizedContext) => {
    try {
      const { tags, status = true } = ctx.request.body;
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        ctx.body = packResponse({ code: 300, msg: '请提供问题标签' });
        return;
      }
      const data = await (this.service as ExpandProblemService<T>).getProblemsByTags(tags, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 根据优先级获取问题集列表
   * @param ctx Koa上下文对象
   */
  public getProblemsByPriority = async (ctx: ParameterizedContext) => {
    try {
      const { priority, status = true } = ctx.request.body;
      if (!priority) {
        ctx.body = packResponse({ code: 300, msg: '请提供优先级' });
        return;
      }
      const data = await (this.service as ExpandProblemService<T>).getProblemsByPriority(priority, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * 获取高优先级问题集列表
   * @param ctx Koa上下文对象
   */
  public getHighPriorityProblems = async (ctx: ParameterizedContext) => {
    try {
      const { minPriority = 7, status = true } = ctx.request.body;
      const data = await (this.service as ExpandProblemService<T>).getHighPriorityProblems(minPriority, status);
      ctx.body = packResponse({
        code: 200,
        data: data,
        msg: '查询成功'
      });
    } catch (err) {
      throw err;
    }
  };
} 