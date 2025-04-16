/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 19:24:48
 * @ Description:
 */
import Koa from 'koa';  // 引入 Koa 框架
import StaticServer from "koa-static";
import KoaWebSocket from "koa-websocket";
import Router from "koa-router";
import KoaBody from 'koa-body';

const router = new Router();

const app = new Koa();  // 创建 Koa 实例

app.use(KoaBody({ 
  multipart: true,
  // formidable: {
  //   //上传文件存储目录
  //   uploadDir:  path.join(__dirname, `/public/uploads/`),
  //   //允许保留后缀名
  //   keepExtensions: true,
  // },
  jsonLimit:'1mb',
  formLimit:'1mb',
  textLimit:'1mb'
}));

app.use(StaticServer('public'));

app.use(router.allowedMethods())
// 简单的中间件示例
app.use(async (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript!';
});

export default app; // 导出 Koa 实例