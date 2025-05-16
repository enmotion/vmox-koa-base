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

export type SchemaOption = Omit<Record<string,any>,'name'|'key'>&{name:string,key:string};
/**
 * 
 * @param err 
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  try{
    // 获取错误名称
    const res : AppResponse = { code:400, data:{ errorName:err.name, errorCode:err.code ?? err.cause?.code } }
    res.data['options'] = {}
    // // 数据库错误
    if(['MongoServerError','MongooseError'].includes(res.data?.errorName)){
      // 数据库错误在此处理, 两个错误类型的返回结构不太一样 MongooseError 将错误信息 封装在了 cause 对象里
      Object.keys(err?.cause?.keyPattern ?? err?.keyPattern).forEach((key:string)=>{
        res.data['options'][key] = schema.path(key).options
      }); // 获取字段的 schema 配置
      res.msg = String(err).split(":")[1].replace(/^\s/g,'');
    }
    if(['ValidationError'].includes(res.data.errorName)){
      // 数据验证错误
      Object.keys(err?.cause?.keyPattern ?? err?.keyPattern).forEach((key:string)=>{
        res.data['options'][key] = schema.path(key).options
      }); // 获取字段的 schema 配置
      res.msg = String(err).split(":")[2].replace(/^\s/g,'');
    }
    return res;
  }catch(error){
    throw error
  }
}
export function resPacket(data:any,msg:string='操作成功',code:number=200,){
  return {
    code,
    data,
    msg
  }
}