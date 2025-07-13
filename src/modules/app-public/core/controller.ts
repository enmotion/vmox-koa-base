/*
 * 第三方暴露接口地址
 * @Author: enmotion
 * @Date: 2025-07-02 17:22:00
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 */

"use strict";
import * as R from "ramda"; // 函数式编程工具库
import { ParameterizedContext } from "koa"; // Koa上下文类型
import { problemService } from "@modules/problems";
import { tagAssociationService, tagService } from "@modules/content-type";
import { getPagination, getSort } from "@lib/serviceTools";
import {
  packResponse,
  fieldsFilter,
  getMongooseQueryFilter,
} from "@lib/serviceTools"; // 响应处理工具

export class AppControllers {
  // 聚合查询操作
  public aggregateProblem = async (ctx: ParameterizedContext) => {
    const body: Record<string, any> = !R.isEmpty(ctx.request.body)
      ? ctx.request.body
      : JSON.parse(JSON.stringify(ctx.query)) ?? {};
    console.log(body, 'aggregateProblem');
    // https://rr4426xx0138.vicp.fun/problems/pub/find
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(R.omit(["page", "sort"], body), {
        title: "title/$regex",
        definition: "definition/$regex",
        example: "example/$regex",
        coreFix: "coreFix/$regex",
        difficultyLevel: "difficultyLevel",
        gradeLevel: [
          "gradeLevel",
          (val: any) => ({
            $lte: parseInt(val),
          }),
        ],
        createdAt: "createdAt/$dateRange",
        updatedAt: "updatedAt/$dateRange",
      }); // 请求值与查询条件的转换
      const page = getPagination(body.page); // 分页参数
      const sort = getSort(body.sort); // 排序参数
      const data = await problemService.aggregate(
        filter,
        { __v: 0 },
        page,
        sort,
        [
          {
            $lookup: {
              from: "user-collections",
              localField: "createdUser",
              foreignField: "uid", // 目标集合的关联字段
              as: "createdUserInfo", // 存储匹配结果的临时字段
              pipeline: [{ $project: { username: 1, nickname: 1 } }],
            },
          },
          {
            $unwind: {
              path: "$createdUserInfo",
              preserveNullAndEmptyArrays: true, // 允许未匹配到创建者（如管理员创建的数据）
            },
          },
          {
            $lookup: {
              from: "user-collections",
              localField: "updatedUser",
              foreignField: "uid", // 目标集合的关联字段
              as: "updatedUserInfo", // 存储匹配结果的临时字段
              pipeline: [{ $project: { username: 1, nickname: 1 } }],
            },
          },
          {
            $unwind: {
              path: "$updatedUserInfo",
              preserveNullAndEmptyArrays: true, // 允许未匹配到创建者（如管理员创建的数据）
            },
          },
          // {
          //   $addFields: {
          //     createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
          //   }
          // },
        ]
      ); // 返回值 字段过滤
      ctx.body = packResponse({
        code: 200,
        data: data[0],
        msg: "查询成功",
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: "请提供查询条件" });
    }
  };

  public aggregateTagAssociationService = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query ?? {};
    // categroyId 不可以与 tagIds 同时存在
    console.log(!R.isNil(query.tagIds) && !R.isEmpty(query.tagIds) && typeof query.tagIds === 'string')
    if(!R.isNil(query.tagIds) && !R.isEmpty(query.tagIds) && typeof query.tagIds === 'string'){
      query.tagIds = (query.tagIds as string).split(",");
      delete query.categoryId;
      delete query.onlyLeaf
    }else{
      delete query.tagIds
    }
    console.log(query,11222)
    const filter = getMongooseQueryFilter(
      R.omit(["page", "sort"], query),
      {
        "name":"name/$regex",
        "tagIds":"tagId/$in",
        "onlyLeaf":["parentAssociationId",(value)=> value=='1'?{$ne:""}:{$regex:""}],
        "key":["key",(value)=>{ return {$regex:value, $options:'i'}}],
        "description":"description/$regex",
        "createdAt":"createdAt/$dateRange",
        "updatedAt":"updatedAt/$dateRange"
      }
    ); // 请求值与查询条件的转换
    const page = getPagination(query.page); // 分页与排序转换
    const sort = getSort(query.sort); // 分页与排序转换
    // 查询模式下，超级管理员在列表中不可见
    const data = await tagAssociationService.aggregate(
      R.mergeAll([filter]),
      { tagInfo:1, parentAssociationId:1 },
      page,
      sort,
      [
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "key", // 目标集合的关联字段
            as: "categoryInfo", // 存储匹配结果的临时字段
            pipeline: [{ $project: { name: 1, key: 1 } }],
          },
        },
        {
          $unwind: {
            path: "$createdUserInfo",
            preserveNullAndEmptyArrays: true, // 允许未匹配到创建者（如管理员创建的数据）
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "tagId",
            foreignField: "key", // 目标集合的关联字段
            as: "tagInfo", // 存储匹配结果的临时字段
            pipeline: [{ $project: { name: 1, key: 1,description:1 } }],
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "parentAssociationId",
            foreignField: "key", // 目标集合的关联字段
            as: "parentAssociationInfo", // 存储匹配结果的临时字段
            pipeline: [{ $project: { name: 1, key: 1 } }],
          },
        },
        {
          $unwind: {
            path: "$updatedUserInfo",
            preserveNullAndEmptyArrays: true, // 允许未匹配到创建者（如管理员创建的数据）
          },
        },
        {
          $addFields: {
            createdUserName: "$creatorInfo.nickname", // 将用户名映射到新字段
          },
        },
      ]
    );
    ctx.body = packResponse({
      code: !R.isEmpty(data[0].items) ? 200 : 400,
      msg: !R.isEmpty(data[0].items) ? "操作成功" : "未找到符合条件的分类标签",
      data: data[0],
    });
  };
}
