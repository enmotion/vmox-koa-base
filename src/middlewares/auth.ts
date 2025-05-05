'use strict';
import type { ParameterizedContext, Next} from "koa";
import * as jwt from 'jsonwebtoken'; // import jwt module for token

async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  const pathname:string = ctx.URL.pathname;
  if(pathname && !pathname.includes('pub/') && pathname!='/favicon.ico'){
    let decoded:any = {};
    try{
      const token  = (ctx.header.authorization as string)?.replace("bearer ","")||"";
      decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY as string) as any; // 验证 token
      ctx.token = decoded;
      await next();
    }catch(err:any){
      if(['JsonWebTokenError','TokenExpiredError'].includes(err?.name)){
        ctx.throw(403,err||'authentication is required or invalid')
      }else{
        console.log(pathname,JSON.stringify(err));
        ctx.throw(400,err||'authentication is required or invalid')
      }
    }
  }else{
    await next();
  }
}
export default middleware;