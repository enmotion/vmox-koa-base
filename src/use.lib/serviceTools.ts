/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:38
 */

"use strict"

import type { Schema } from "mongoose";
import type { AppResponse } from "@type/index";
/**
 * 
 * @param err 
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  try{
    console.log(err,String(err));
    // 获取错误名称
    const res : AppResponse = { code:400, data:{ name:err.name }, msg:'' }
    // // 数据库错误
    if(['MongoServerError','MongooseError'].includes(res.data?.name)){
      // 数据库错误在此处理, 两个错误类型的返回结构不太一样 MongooseError 将错误信息 封装在了 cause 对象里
      res.data['key'] = Object.keys(err?.cause?.keyPattern ?? err?.keyPattern)?.[0]
      res.data['options'] = schema.path(res.data['key']).options; // 获取字段的 schema 配置
      res.msg = String(err).split(":")[1].replace(/^\s/g,'');
    }
    if(['ValidationError'].includes(res.data.name)){
      // 数据验证错误
      res.data['key'] = Object.keys(err?.errors)?.[0];
      res.data['options'] = schema.path(res.data['key']).options; // 获取字段的 schema 配置
      res.msg = String(err).split(":")[2].replace(/^\s/g,'');
    }
    return res;
  }catch(error){
    throw error
  }
}