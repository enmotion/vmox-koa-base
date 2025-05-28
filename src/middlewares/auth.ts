'use strict';
import type { ParameterizedContext, Next} from "koa";
import * as jwt from 'jsonwebtoken'; // import jwt module for token
import { userService } from "src/modules/users-class";

async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  const pathname:string = ctx.URL.pathname;
  // console.log(ctx)
  if(pathname && !pathname.includes('pub/') && pathname!='/favicon.ico'){
    let decoded:any = {};
    try{
      const token = (ctx.header.authorization as string)?.replace("bearer ","")||"";
      decoded = jwt.verify(token, process.env.APP_JWT_KEY as string) as any; // 验证 token
      ctx.token = decoded;
      const currentUser = await userService.findOne({uid:ctx.token?.uid})
      if(currentUser?.loginCount && ctx.token.loginCount < currentUser?.loginCount){
        throw {
          code: 401,
          msg: '该账号已在别处登录',
          data: null
        }
      }
      if(currentUser?.powVersion && ctx.token.powVersion < currentUser?.powVersion){
        throw {
          code: 401,
          msg: '该账号的权限已变更，需要重新登录',
          data: null
        }
      }
      if(!currentUser?.status){
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