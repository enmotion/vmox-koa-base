import mongoose from "mongoose";
import type { Schema } from "mongoose";
/**
 * 
 * @param err 
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  // 获取错误名称
  const error: Record<string,any> = {name:Object(err).name}
  // 数据库错误
  if(error.name === 'MongoServerError'){
    // 数据库错误在此处理
    error['key'] = Object.keys(err.keyPattern)[0]
    error['options'] = schema.path(error['key']).options;
  }
  if(error.name === 'ValidationError'){
    // 数据验证错误
    error['key'] = Object.keys(err.errors)[0];
    error['options'] = schema.path(error['key']).options;
  }
  return error;
}