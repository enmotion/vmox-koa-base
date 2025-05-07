'use strict';
import type { ParameterizedContext, Next } from "koa";
async function middleware(ctx:ParameterizedContext,next:Next):Promise<void>{
  try {
    await next();    
  } catch (err) {
    console.log(err)
    ctx.body = err
  }
}
export default middleware;