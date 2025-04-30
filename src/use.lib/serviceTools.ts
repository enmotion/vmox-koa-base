import mongoose from "mongoose";
import type { Schema } from "mongoose";
/**
 * 
 * @param err 
 */
export function mongoDBErrorTransform(err:any,schema:Schema){
  try{
    // 获取错误名称
    const error: Record<string,any> = {name:err.name}
    // // 数据库错误
    if(['MongoServerError','MongooseError'].includes(err.name)){
      // 数据库错误在此处理, 两个错误类型的返回结构不太一样 MongooseError 将错误信息 封装在了 cause 对象里
      error['key'] = Object.keys(err.cause?.keyPattern ?? err.keyPattern)[0]
      error['options'] = schema.path(error['key']).options; // 获取字段的 schema 配置
      error['message'] = String(err).split(":")[1].replace(/\s/g,'')
      console.log(error)
    }
    if(['ValidationError'].includes(error.name)){
      // 数据验证错误
      console.log(err)
      error['key'] = Object.keys(err.errors)[0];
      error['options'] = schema.path(error['key']).options; // 获取字段的 schema 配置
      error['message'] = String(err).split(":")[1].replace(/\s/g,'')
    }
    return error;
  }catch(error){
    throw error
  }
  
}