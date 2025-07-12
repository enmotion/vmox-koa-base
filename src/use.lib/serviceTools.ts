/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:38
 */

"use strict"
import * as R from "ramda";
import { unknown, z } from "zod";
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
      Object.keys(err?.cause?.keyPattern ?? err?.keyPattern?? {}).forEach((key:string)=>{
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
  '$eq' | '$ne' | '$not' |            // 等于/不等于/逻辑非
  '$gt' | '$gte' | '$lt' | '$lte' |   // 大于/大于等于/小于/小于等于
  '$range' | '$dateRange' |           // 自定义范围操作符（非原生MongoDB操作符）
  '$in' | '$nin' |                    // 包含/不包含于数组
  '$regex' | '$exists'                // 正则匹配/字段存在性检查
// 实际已经扩展为全部方法了

export type MongooseFilterMapping = Record<string, string|[string,(value:any)=>any]>
/**
 * 将嵌套结构的查询条件转换为平面结构的 MongoDB/Mongoose 查询对象
 * 
 * 功能说明：
 * 1. 根据字段映射规则（mapping），将原始嵌套条件中的字段路径转换为目标路径，并处理特殊操作符（如自定义的 $range）。
 * 2. 支持动态值转换（通过映射配置中的函数）。
 * 3. 自动清理已映射的原始字段，避免重复处理。
 * 4. 保留未映射的字段，并合并到最终结果中。
 * 
 * @param condition - 原始查询条件对象，支持多级嵌套结构（例如 `{ user: { address: { city: "NY" } } }`）。
 * @param mapping - 字段映射配置表，格式为：
 *   - Key: 原始字段路径（用斜杠 `/` 分隔，例如 "user/address/city"）。
 *   - Value: 目标配置，可以是以下两种形式：
 *     a) 字符串：目标字段路径，可包含操作符（例如 "location.city.$eq"）。
 *     b) 元组 [string, (value: any) => any]：
 *        - 字符串: 目标字段路径
 *        - 函数: 对原始值的转换函数
 * 示例映射：
 *   { 
 *     "user/age": "age.$eq", // 将 user.age 转换为 age 字段的等于条件
 *     "range": ["price.$range", (v) => [v.min, v.max]] // 自定义值转换
 *   }
 * 
 * @returns 符合 Mongoose 查询语法的平面结构对象，合并了映射后的字段和未映射的原始字段。
 */

export function getMongooseQueryFilter(
  query: Record<string, any>,      // 支持多级嵌套的查询条件
  mapping: MongooseFilterMapping = {}, // 字段路径映射规则（默认空配置）
  only:boolean = false // 是否只提取only数据，原本的对象数据需要经过 mapping 过滤
): Record<string, any> {                // 返回转换后的平面结构对象
  // 初始化一个空对象，用于存储转换后的平面查询对象
  let result: Record<string, any> = {};
  let condition:Record<string,any> = R.clone(query)
  // 遍历映射配置，对每个映射规则进行处理，实现字段的转换
  Object.entries(mapping).forEach(([originPath, targetPath]) => {
    // 将原始字段路径按斜杠分割成数组，便于后续从原始对象中获取对应的值
    const originPaths = originPath.split("/");
    // 判断目标路径是否为数组，如果是数组，取数组第一项并按斜杠分割；否则直接按斜杠分割目标路径
    const targetPaths = Array.isArray(targetPath) ? targetPath[0].split('/') : targetPath.split('/');
    // 使用 Ramda 库的 path 函数，根据分割后的原始路径数组从原始对象中获取对应的值
    let value = R.path(originPaths, condition);

    // 检查获取的值是否存在，如果存在则进行后续处理
    if (!!value) {
      // 如果目标路径是数组，说明需要对值进行额外处理，调用数组第二项的函数处理值；否则直接使用该值
      value = Array.isArray(targetPath) ? targetPath[1](value) : value;

      // 处理特殊的 $range 操作符，如果值是数组且目标路径的最后一项是 $range
      if (Array.isArray(value) && targetPaths[targetPaths.length - 1] === '$range') {
        // 初始化一个空对象，用于存储转换后的范围查询条件
        const rangeValue: Record<string, any> = {};
        // 如果数组的第一项存在，则将其作为 $gte（大于等于）条件添加到范围查询对象中
        value[0] !== undefined && (rangeValue['$gte'] = value[0]);
        // 如果数组的第二项存在，则将其作为 $lte（小于等于）条件添加到范围查询对象中
        value[1] !== undefined && (rangeValue['$lte'] = value[1]);
        // 将处理后的范围查询对象赋值给 value
        value = rangeValue;
        // 移除目标路径数组的最后一项，即移除 $range 标记
        targetPaths.pop();
      }
      // 对日期范围进行转换
      if (Array.isArray(value) && targetPaths[targetPaths.length - 1] === '$dateRange') {
        // 初始化一个空对象，用于存储转换后的范围查询条件
        const rangeValue: Record<string, any> = {};
        // 如果数组的第一项存在，则将其作为 $gte（大于等于）条件添加到范围查询对象中
        value[0] !== undefined && (rangeValue['$gte'] = new Date(value[0]));
        // 如果数组的第二项存在，则将其作为 $lte（小于等于）条件添加到范围查询对象中
        value[1] !== undefined && (rangeValue['$lte'] = new Date(value[1]));
        // 将处理后的范围查询对象赋值给 value
        value = rangeValue;
        // 移除目标路径数组的最后一项，即移除 $range 标记
        targetPaths.pop();
      }
      // 使用 Ramda 库的 assocPath 函数，将处理后的值写入结果对象的目标路径
      result = R.assocPath(targetPaths, value, result);
      // 使用 Ramda 库的 dissocPath 函数，从原始查询条件对象中移除已处理的原始字段，避免重复处理
      condition = R.dissocPath(originPaths, condition);
    } else {
      // 如果获取的值不存在，同样从原始查询条件对象中移除该原始字段
      condition = R.dissocPath(originPaths, condition);
    }
  });

  // 使用 Ramda 库的 mergeDeepRight 函数，将剩余未映射的字段和已转换的字段合并到一个对象中并返回
  return only ? result : R.mergeDeepRight(condition, result);
}
/**
 * 拼装 qdrant 查询数据结构
 */

/**
 * 将源数据转换为Qdrant兼容的过滤器格式
 * @param data 源数据对象（支持嵌套结构）
 * @param mapping 字段映射配置：
 *   - key: 源数据路径（支持'/'分隔的嵌套路径）
 *   - value: {
 *       target: 目标字段名,
 *       match: 匹配规则（字符串路径或[路径, 转换函数]）
 *     }
 * @returns Qdrant过滤器数组（每个元素包含key和匹配条件）
 */
export function getQdrantFilter(
  data: Record<string, any>,
  mapping: Record<string, { target: string; match: string | [string, (value: any) => any] }>
): Record<string, any>[] {
  // 获取所有需要处理的源字段路径
  const sourceKeys = R.keys(mapping);
  // 获取所有目标配置项
  const targetItems = R.values(mapping);
  const filters: Record<string, any>[] = [];

  // 遍历每个源字段配置
  sourceKeys.forEach((key: string, index: number) => {
    // 使用Ramda的path方法获取嵌套数据（支持'a/b/c'格式路径）
    const value = R.path(key.split('/'), data);
    
    // 仅处理非空值
    if (!R.isNil(value)) {
      const item = targetItems[index];
      
      // 处理匹配规则：字符串路径直接使用，数组路径需应用转换函数
      const matchData = typeof item.match === 'string' 
        ? R.assocPath(item.match.split("/"), value, {})  // 简单路径映射
        : R.assocPath(item.match[0].split("/"), item.match[1](value), {});  // 带转换函数的映射
      
      // 合并匹配条件和目标字段名
      filters.push(
        R.mergeAll([
          matchData,
          { key: item.target }  // 添加目标字段标识
        ])
      );
    }
  });

  return filters;
}
/*------------------------------------------------------------------------------------*/

/**
 * 分页参数验证Schema
 * 使用Zod库定义分页参数的数据结构和验证规则
 */
export type Page = { current: number, size: number };

const pageSchemaZod = z.object({
  /**
   * 当前页码字段验证规则
   * - 必须是数字类型（非数字时报错："页码必须是数字"）
   * - 必须是整数（小数时报错："页码必须是整数"）
   * - 必须是正数（0或负数时报错："页码必须大于0"）
   * - 描述信息：说明页码从1开始计数
   */
  current: z.number({ message: '页码必须是数字' })
    .int('页码必须是整数')
    .positive('页码必须大于0')
    .describe('当前页码，从1开始计数'),

  /**
   * 分页大小字段验证规则
   * - 必须是数字类型（非数字时报错："分页大小必须是数字"）
   * - 必须是整数（小数时报错："分页大小必须是整数"）
   * - 必须是正数（0或负数时报错："分页大小必须大于0"）
   * - 最大值限制500（超过时报错："分页大小不能超过500"）
   * - 描述信息：说明这是每页显示记录数
   */
  size: z.number({ message: '分页大小必须是数字' })
    .int('分页大小必须是整数')
    .positive('分页大小必须大于0')
    .max(500, '分页大小不能超过500')
    .describe('每页显示记录数')
})

/**
 * 获取验证后的分页参数
 * @param page 待验证的分页参数对象（包含current和size字段）
 * @returns 验证通过返回原对象，失败返回undefined
 * @note 使用safeParse进行非抛出式验证，避免try-catch
 * @note 返回类型明确表示为包含page和size字段的对象或void
 * @warning 输入参数类型为any，建议后续改为unknown更安全
 */
export function getPagination(page: unknown, startWidth1:boolean = true):Page | null {
  // 使用safeParse进行验证（不会抛出异常）
  const result = pageSchemaZod.safeParse(page);
  // 验证成功返回原始数据，失败返回undefined
  // 注意：这里返回的是原始输入data 而非result.data，保持与历史版本兼容
  if(result.success){
    const data = R.clone(page) as Page;
    startWidth1 && (data.current = Math.max(0,data?.current-1)) // 确保当前页-1且不可低于0
    return data
  }else{
    return null
  }
}

/*------------------------------------------------------------------------------------*/

// 定义标准化后的排序类型，仅包含小写形式和数字
export type Sort = Record<string, 1 | -1 | 'desc' | 'asc'>;

// 使用zod创建排序值的验证模式
const sortSchemaZod = z.object({}).catchall(
  z.union([
    z.literal(1),      // 允许数字1
    z.literal(-1),     // 允许数字-1
    z.literal('DESC'), // 允许大写DESC
    z.literal('ASC'),  // 允许大写ASC
    z.literal('desc'), // 允许小写desc
    z.literal('asc'),  // 允许小写asc
  ])
).describe("值必须是-1,1,desc,asc"); // 添加模式描述

/**
 * 处理排序参数并标准化
 * @param sort 未知类型的排序参数
 * @returns 标准化后的Sort对象或null(验证失败时)
 */
export function getSort(sort: unknown):Sort | null {
  // 检查输入是否为有效对象
  if (!sort || typeof sort !== 'object') return null;
  // 使用safeParse进行验证（不会抛出异常）
  const result = sortSchemaZod.safeParse(sort);
  if(result.success){
    // 深度克隆输入对象避免污染原数据
    const data = R.clone(sort) as Sort
    // 遍历并标准化每个排序值
    Object.entries(data).forEach(([key,value])=>{
      data[key] = typeof value == 'number' ? value : (value?.toLowerCase()=='desc'?-1:1)
    })
    return data as Sort
  }else{
    return null
  }
}