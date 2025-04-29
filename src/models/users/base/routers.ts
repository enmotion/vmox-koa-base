'use strict';
import { keys } from "ramda";
// 引入 Koa 的路由模块
import Router from 'koa-router';
// 引入用户控制器模块
import useUserController from './controller';
// 引入 Koa 路由允许方法选项的类型定义
import type { IRouterAllowedMethodsOptions } from "koa-router";

/**
 * 定义控制器路由映射的类型
 * 该类型包含两个属性：
 * - httpMethod: 表示 HTTP 请求的方法，支持常见的 HTTP 方法
 * - handlerName: 表示处理该请求的控制器方法名称
 */
export type ControllerRouterMapping = {
  routerPath:`/${string}`
  // HTTP 请求方法，涵盖了标准的 HTTP 方法
  httpMethod: 'post' | 'get' | 'delete' | 'put' | 'head' | 'options' | 'patch';
  // 处理该请求的控制器方法的名称
  handlerName: string;
};

/**
 * 创建并配置用户路由的函数
 * @param prefix - 路由的前缀，格式为以斜杠开头的字符串
 * @param controllers - 用户控制器实例，通过 useUserController 函数返回
 * @param routerMapping - 路由映射对象，键为以斜杠开头的路径，值为 ControllerRouterMapping 类型
 * @returns 配置好的 Koa 路由实例
 */
export default function useUserRouter(
  // 路由前缀，必须是以斜杠开头的字符串
  prefix: `/${string}`, 
  // 用户控制器实例，由 useUserController 函数返回
  controllers: ReturnType<typeof useUserController>, 
  // 路由映射对象，默认值为空对象
  routerMapping: ControllerRouterMapping[] = [
    {routerPath:'/register',httpMethod:'post',handlerName:'register'},
    {routerPath:'/create',httpMethod:'get',handlerName:'create'},
    {routerPath:'/delete',httpMethod:'delete',handlerName:'delete'},
    {routerPath:'/update',httpMethod:'put',handlerName:'update'},
    {routerPath:'/query',httpMethod:'get',handlerName:'query'},
    {routerPath:'/find',httpMethod:'get',handlerName:'find'},
  ]
) {
  // 创建一个 Koa 路由实例，并设置路由前缀
  const router = new Router({ prefix: prefix });
  /**
   * 以下部分手动注入控制器方法，创建具体的路由：
   * 这些路由是硬编码的，用于处理特定的用户操作
   */
  routerMapping.forEach((item,index)=>{
    if(!!(controllers as Record<string,any>)[item.handlerName as string]){
      router[item.httpMethod](item.routerPath,(controllers as Record<string,any>)[item.handlerName as string])
    }
  })
  // 返回配置好的路由实例
  return router;
}