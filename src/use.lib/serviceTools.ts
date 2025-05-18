/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:38
 */

"use strict"
import * as R from "ramda";
import type { Schema, RootFilterQuery} from "mongoose";
import type { RecordResponse } from "@type/index";

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
 * @returns {RecordResponse} 标准化错误响应
 * @throws 处理过程中的异常
 * @description 将 MongoDB/Mongoose 原生错误转换为标准化响应格式
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  try{
    // 初始化响应结构
    const res : RecordResponse<Record<string,any>> = { code:400, data:{ errorName:err.name, errorCode:err.code ?? err.cause?.code } }
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
      Object.keys(err?.cause?.keyPattern ?? err?.errors ?? err?.keyPattern).forEach((key:string)=>{
        res.data['options'][key] = schema.path(key).options
      });
      res.msg = String(err).split(":")[2].replace(/^\s/g,'');
    }
    return res;
  }catch(error){
    console.log("-----")
    console.log(error,'ssssss')
    console.log("-----")
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

// 定义Mongoose支持的查询操作符类型（包含比较/逻辑/范围等操作符）
export type MongooseOperators = 
  '$eq' | '$ne' | '$not' |        // 等于/不等于/逻辑非
  '$gt' | '$gte' | '$lt' | '$lte' | // 大于/大于等于/小于/小于等于
  '$range' |                      // 自定义范围操作符（非原生MongoDB操作符）
  '$in' | '$nin' |                // 包含/不包含于数组
  '$regex' | '$exists'            // 正则匹配/字段存在性检查
// 实际已经扩展为全部方法了
/**
 * 将嵌套结构的查询条件转换为平面结构的MongoDB查询对象
 * @param condition - 原始查询条件对象（支持嵌套字段路径如"user.address.city"）
 * @param mapping - 字段映射配置表（格式: { "原字段路径": "目标字段路径.$操作符" }）
 * @returns 符合Mongoose查询语法的平面结构对象
 */
export function conditionMappingToRootFilterQuery(
  condition: Record<string, any>,      // 支持多级嵌套的查询条件
  mapping: Record<string, string> = {} // 字段路径映射规则（默认空配置）
): Record<string, any> {                // 返回转换后的平面结构对象
  let result: Record<string, any> = {} // 存储转换后的平面查询对象
  
  // 遍历映射配置处理字段转换
  Object.entries(mapping).forEach(([originPath, targetPath]) => {
    const originPaths = originPath.split(".");
    const targetPaths = targetPath.split('.');
    let value = R.path(originPaths, condition); // 从原始对象获取值
    if (value !== undefined && value !== null) {
      // 处理特殊$range操作符（转换为$gte/$lte范围查询）
      if (Array.isArray(value) && targetPaths[targetPaths.length-1] === '$range') {
        const rangeValue: Record<string, any> = {};
        value[0] !== undefined && (rangeValue['$gte'] = value[0]);
        value[1] !== undefined && (rangeValue['$lte'] = value[1]);
        value = rangeValue;
        targetPaths.pop(); // 移除末尾的$range标记
      }
      // 将处理后的值写入结果对象的目标路径
      result = R.assocPath(targetPaths, value, result);
      // 移除已处理的原始字段（避免重复处理）
      condition = R.dissocPath([originPaths[0]], condition);
    }
  });
  // 合并剩余未映射字段和已转换字段
  return R.mergeDeepRight(condition, result);
}

/**
 * 分页和排序参数类型
 * @template T 原始查询参数类型
 */
export type Pagination<T extends Record<string,any>> = Omit<T,'pagination'|'sort'> & {
  page:{size:number,current:number}|false // 分页配置，false表示不分页
  sort:Record<string,-1|1|'desc'|'asc'>   // 排序配置
}
/**
 * 从查询参数中提取分页和排序信息
 * @param query 包含分页和排序的查询参数
 * @returns 处理后的分页和排序对象
 */
export function getPaginationAndSort<T extends Record<string,any>>(query:Partial<Pagination<T>>){
  // 合并默认值和传入的查询参数
  const queryData:Pagination<T> = R.mergeAll([
    {page:false, sort:{}}, // 默认值
    R.pick(['page','sort'],query) // 从查询参数中提取page和sort
  ]) as Pagination<T>;
  
  // 规范化排序字段的值
  Object.entries(queryData.sort).map(([key,value])=>{
    if(['DESC','ASC','desc','asc',1,-1].includes(value)){
      // 将字符串形式的排序转换为统一格式
      queryData.sort[key] = [1,-1].includes(value as number) 
        ? value 
        : R.toLower(value as string) as 'desc'|'asc'
    }
  })
  !!queryData.page && (queryData.page.current = Math.max(0,queryData.page.current-1))
  return {
    ...queryData,
  }
}