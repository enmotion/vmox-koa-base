/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by:   enmotion 
 * @Last Modified time: 2025-05-07 12:25:12 
 */

"use strict"
import type { Schema } from "mongoose";
/**
 * 
 * @param err 
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  // 获取错误名称
  const error: Record<string,any> = {name:Object(err).name} 
  Object.keys(err).forEach(key=>error[key]=err[key]);
  // 数据库错误
  if(error.name === 'MongoServerError'){
    // 数据库错误在此处理
    error['options'] = schema.path(Object.keys(error.keyPattern)[0]).options;
  }
  return error;
}