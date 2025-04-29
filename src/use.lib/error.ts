/*
 * @Author: enmotion 
 * @Date: 2025-04-29 11:31:56 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:46:53
 */

// 定义标准错误返回对象的类型
export type ErrorResponse = {
  status: number;
  code: number;
  message: string;
  data: any;
};

export enum ErrorCode {
  // 访问错误
  INVALID_INTERFACE_OR_RESOURCE = "INVALID_INTERFACE_OR_RESOURCE", // 404
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED", // 102 新增：请求方法不被允许
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",  // 103 新增：请求频率过高

  // 业务错误
  AUTHENTICATION_TOKEN_INVALID = "AUTHENTICATION_TOKEN_INVALID", // 201token 验证失败 或 失效
  PERMISSION_DENIED = "PERMISSION_DENIED", // 203 权限不够
  RESOURCE_OR_SERVICE_NOT_FOUND = "RESOURCE_OR_SERVICE_NOT_FOUND", // 404
  SERVER_CODE_EXECUTION_ERROR = "SERVER_CODE_EXECUTION_ERROR",
  DATA_VALIDATION_ERROR = "DATA_VALIDATION_ERROR",
  DATA_CONFLICT = "DATA_CONFLICT",      // 新增：数据冲突，例如创建已存在的唯一资源
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED",   // 新增：需要付费才能继续操作
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY" // 新增：请求格式正确，但包含语义错误无法处理

  // // 访问错误
  // INVALID_INTERFACE_OR_RESOURCE = 101,
  // METHOD_NOT_ALLOWED = 102, // 新增：请求方法不被允许
  // TOO_MANY_REQUESTS = 103,  // 新增：请求频率过高

  // // 业务错误
  // AUTHENTICATION_TOKEN_INVALID = 201,
  // AUTHENTICATION_TOKEN_EXPIRED = 202,
  // PERMISSION_DENIED = 203,
  // RESOURCE_OR_SERVICE_NOT_FOUND = 204,
  // SERVER_CODE_EXECUTION_ERROR = 205,
  // DATA_VALIDATION_ERROR = 206,
  // DATA_CONFLICT = 207,      // 新增：数据冲突，例如创建已存在的唯一资源
  // PAYMENT_REQUIRED = 208,   // 新增：需要付费才能继续操作
  // UNPROCESSABLE_ENTITY = 209 // 新增：请求格式正确，但包含语义错误无法处理
}

// export const ErrorData:Record<keyof typeof ErrorType, Error>={
//   "SERVER_ERROR":{
//     status:500,
//     code:500,
//     data:null,
//     message:'服务器未知错误'
//   },
//   "DATABASE_ERROR":{
//     status:200,
//     code:200,
//     data:null,
//     message:'数据库操作未知错误'
//   },
//   "ERROR":{
//     status:200,
//     code:301,
//     data:null,
//     message:'数据库操作错误'
//   },
// }