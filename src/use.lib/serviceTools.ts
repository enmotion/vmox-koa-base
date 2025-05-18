/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:38
 */

"use strict"
import * as R from "ramda";
import type { Schema } from "mongoose";
import type { AppResponse } from "@type/index";

/**
 * Schema 配置项类型定义
 * @property {string} name - 字段名称
 * @property {string} key - 字段键名
 * @extends Omit<Record<string,any>,'name'|'key'> - 排除基础类型的 name/key 属性
 */
export type SchemaOption = Omit<Record<string,any>,'name'|'key'>&{name:string,key:string};

/**
 * MongoDB 错误转换器
 * @param {any} err - 原始错误对象
 * @param {Schema} schema - Mongoose Schema 实例
 * @returns {AppResponse} 标准化错误响应
 * @throws 处理过程中的异常
 * @description 将 MongoDB/Mongoose 原生错误转换为标准化响应格式
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  try{
    // 初始化响应结构
    const res : AppResponse = { code:400, data:{ errorName:err.name, errorCode:err.code ?? err.cause?.code } }
    res.data['options'] = {} // 存储字段配置信息

    // 处理 MongoDB 原生错误
    if(['MongoServerError','MongooseError'].includes(res.data?.errorName)){
      // 提取冲突字段的 Schema 配置
      Object.keys(err?.cause?.keyPattern ?? err?.keyPattern).forEach((key:string)=>{
        res.data['options'][key] = schema.path(key).options
      });
      // 从错误消息中提取有效信息
      res.msg = String(err).split(":")[1].replace(/^\s/g,'');
    }

    // 处理数据验证错误
    if(['ValidationError'].includes(res.data.errorName)){
      Object.keys(err?.cause?.keyPattern ?? err?.keyPattern).forEach((key:string)=>{
        res.data['options'][key] = schema.path(key).options
      });
      res.msg = String(err).split(":")[2].replace(/^\s/g,'');
    }
    return res;
  }catch(error){
    throw error
  }
}

/**
 * 字段过滤器
 * @this {any} - 绑定上下文对象
 * @param {object} fields - 过滤配置
 * @param {string[]} [fields.pick] - 需保留的字段数组
 * @param {string[]} [fields.omit=['__v','_id']] - 需排除的字段数组
 * @returns {any} 过滤后的数据
 * @description 根据配置选择性地保留/排除对象字段
 */
export function fieldsFilter(this:any,fields:Partial<{pick:string[],omit:string[]}>={omit:['__v','_id']}){
  if(!R.isEmpty(this) && !R.isNil(this) && typeof this == 'object'){
    const data = JSON.parse(JSON.stringify(this));
    // 优先应用 pick 规则，其次 omit 规则，最后返回原数据
    return !!fields.pick ? (R.pick(fields.pick,data)) : (!!fields.omit ? R.omit(fields.omit,data) : data);
  }else{
    return this
  }
}

/**
 * 响应包装器
 * @param {object} res - 原始响应对象
 * @param {number} [res.code] - 状态码
 * @param {any} [res.data] - 响应数据
 * @param {string} [res.msg] - 消息文本
 * @returns {object} 标准化响应
 * @description 将原始响应包装为标准化格式
 */
export function packResponse(res:Partial<{code:number,data:any,msg:string}>){
  // 合并默认值和传入参数
  const response = R.mergeAll([{code:200,data:null},res]);
  response.data = JSON.parse(JSON.stringify(response.data))
  // 设置默认消息
  response.msg = response.msg ?? (response.code == 200 ? '操作成功':'异常错误');
  return response
}