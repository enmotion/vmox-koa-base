'use strict';
import type { ParameterizedContext, Next} from "koa";
import * as jwt from 'jsonwebtoken'; // import jwt module for token
import { userService } from "@modules/users-class";
import { expandAppService } from "@modules/app-manage/";
import { appPublicRouter } from "@modules/app-public";

const appPublicRouterPaths = appPublicRouter.stack.map(s=>s.path)

async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  const pathname:string = ctx.URL.pathname;
  if(pathname.includes('app/') && appPublicRouterPaths.includes(pathname)){
    // console.log(ctx)
    const app = await expandAppService.find({apiKey:ctx.header.apikey})
    if(app.items[0].status){
      await next();
      return
    }else{
      throw {
        code: 401,
        msg: '没有合法的 apiKey 或者 当前apiKey 已经被禁用',
        data: null
      }
    }
  }
  // console.log(ctx)
  if(pathname && !pathname.includes('pub/') && pathname!='/favicon.ico'){
    let decoded:any = {};
    try{
      const token = (ctx.header.authorization as string)?.replace("bearer ","")||"";
      decoded = jwt.verify(token, process.env.APP_JWT_KEY as string) as any; // 验证 token
      const visitor = await userService.findOne({uid:decoded?.uid})
      ctx.visitor = visitor;
      if(ctx.visitor?.loginCount && ctx.visitor.loginCount < ctx.visitor?.loginCount){
        throw {
          code: 401,
          msg: '该账号已在别处登录',
          data: null
        }
      }
      if(ctx.visitor?.powVersion && ctx.visitor.powVersion < ctx.visitor?.powVersion){
        throw {
          code: 401,
          msg: '该账号的权限已变更，需要重新登录',
          data: null
        }
      }
      if(!ctx.visitor?.status){
        throw {
          code: 401,
          msg: '该用户已经被禁用',
          data: null
        }
      }
      await next();
    }catch(err:any){
      if(['JsonWebTokenError','TokenExpiredError'].includes(err?.name)){
        throw {
          code:401,
          msg: err||'authentication is required or invalid',
          data:null
        }
      }else{
        throw err
      }
    }
  }else{
    await next();
  }
}
export default middleware;