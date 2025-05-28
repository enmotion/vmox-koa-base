/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:47
 */

"use strict"

/**
 * 通用列表响应类型 (带泛型支持)
 * @template T 列表项数据类型
 * @property code 状态码(如200表示成功)
 * @property msg 可选的消息说明
 * @property data 包含T类型数组的响应数据
 */
export type ListResponse<T extends any> = {
  code:number,
  msg?:string,
  data:T[]
}

/**
 * 分页响应类型 (带泛型支持)
 * @template T 分页项数据类型
 * @property code 状态码
 * @property msg 可选的消息说明
 * @property data 分页数据对象
 * @property data.list 当前页数据列表
 * @property data.total 数据总条数(用于分页计算)
 */
export type PageResponse<T extends any> = {
  code:number,
  msg?:string,
  data:{
    list:T[],
    total:number
  }
}

/**
 * 记录响应类型 (带泛型支持)
 * @template T 记录数据类型
 * @property code 状态码
 * @property msg 可选的消息说明
 * @property data 可以是单条T类型记录或AppListResponse格式的列表
 */
export type RecordResponse<T extends any> = {
  code:number,
  msg?:string,
  data:T | AppListResponse<T>
}

export type ExpandUser = {
  uid: string;
  username: string;
  email: string;
  loginCount: number;
  // ... 其他属性 ...
};