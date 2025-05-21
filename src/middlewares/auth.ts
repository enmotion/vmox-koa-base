'use strict';
import type { ParameterizedContext, Next} from "koa";
import * as jwt from 'jsonwebtoken'; // import jwt module for token

async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  const pathname:string = ctx.URL.pathname;
  // console.log(ctx)
  if(pathname && !pathname.includes('pub/') && pathname!='/favicon.ico'){
    let decoded:any = {};
    try{
      const token = (ctx.header.authorization as string)?.replace("bearer ","")||"";
      decoded = jwt.verify(token, process.env.APP_JWT_KEY as string) as any; // 验证 token
      ctx.token = decoded;
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