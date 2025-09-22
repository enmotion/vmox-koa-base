'use strict';
import colors from "colors"
import type { ParameterizedContext, Next } from "koa";

/**
 * Koa全局错误处理中间件
 * @function middleware
 * @desc 捕获应用层未处理的异常，标准化错误响应格式
 * @param {ParameterizedContext} ctx - Koa上下文对象
 * @param {Next} next - 中间件执行链控制函数
 * 
 * @behavior
 * 1. 尝试执行后续中间件
 * 2. 捕获到错误时：
 *    - 有错误码的：保留结构化错误信息（生产环境隐藏敏感数据）
 *    - 无错误码的：包装为500系统错误
 * 
 * @note 生产环境会过滤错误详情(data字段)，开发环境保留完整错误堆栈
 * @warning 需确保上游中间件抛出的错误包含code字段才能被识别为业务错误
 */
async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  const startTIme=Date.now()
  try {
    // 执行后续中间件链
    await next();
    // console.log('接口:',colors.red(ctx.URL.href))
    console.log('接口总耗时:',colors.red((Date.now()-startTIme)+''))
  } catch (err:any) {
    console.log(colors.red(err))
    // 识别标准业务错误（包含code字段）
    if(!!err.code){
      // 生产环境隐藏错误详情防止信息泄露
      err.data = process.env.NODE_ENV == 'production' ? null : err.data
      ctx.body = err
    }else{
      // 非预期错误的标准化处理
      ctx.status = 500;  // 强制设置HTTP状态码
      ctx.body = {
        code: 500,       // 统一错误码
        data: String(err),  // 原始错误信息（开发调试用）
        msg: '未知错误'   // 用户友好提示
      };
    }
    // console.log('接口:',colors.red(ctx.URL.href))
    console.log('接口总耗时:',colors.red((Date.now()-startTIme)+''))
  }
}
export default middleware;