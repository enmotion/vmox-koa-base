/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 19:17:19
 * @ Description:
 */
import Koa from 'koa';  // 引入 Koa 框架
import StaticServer from "koa-static";
import KoaWebSocket from "koa-websocket";
import Router from "koa-router";
import KoaBody from 'koa-body';

const router = new Router();
router.allowedMethods()
const app = new Koa();  // 创建 Koa 实例
app.use(StaticServer('public'));
// 简单的中间件示例
app.use(async (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript!';
});

export default app; // 导出 Koa 实例