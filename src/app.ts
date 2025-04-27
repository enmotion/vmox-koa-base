/**
 * @ Author: enmotion
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-27 14:24:44
 * @ Description: 这是一个基于 Koa 框架的简单服务器应用，支持 WebSocket 和静态文件服务
 */
import Koa from 'koa';  // 引入 Koa 框架，这是一个轻量级的 Node.js Web 应用框架。
import path from "path"; // Node.js 核心模块，用于处理和转换文件路径。
import fs from 'fs'; // Node.js 核心文件系统模块，用于读取本地文件。
import { mongoose } from "./database"
import StaticServer from "koa-static"; // koa-static 是一个用于提供静态文件服务的 Koa 中间件。
import KoaWebSocket from "koa-websocket"; // koa-websocket 是一个用于支持 WebSocket 的 Koa 中间件。
import Router from "koa-router"; // koa-router 是一个用于处理路由的 Koa 中间件库。
import KoaBody from 'koa-body'; // koa-body 是一个用于处理 POST 请求体的 Koa 中间件。
import { getLocalServerIP } from '@lib/tools';
import { userUserModel } from "./models/users"
const router = new Router();

// // 读取 SSL 证书与密钥文件，用于 HTTPS 连接。这里假设 ssl 证书和密钥文件放在项目的 ssl 文件夹中。
// const options = {
//   key: fs.readFileSync(path.join(__dirname,'ssl','mid.wow11.key')),
//   cert: fs.readFileSync(path.join(__dirname,'ssl','mid.wow11.pem')),
// };

// 创建 Koa 实例并判断是否为开发环境。如果不是开发环境，则启用 HTTPS。
// 注意：在生产环境中，需要确保安全地管理 SSL 密钥和证书文件，避免泄露。
// const app = process.env.KOA_APP_NODE_ENV == "development" ? KoaWebSocket(new Koa()) : KoaWebSocket(new Koa(), {}, options);
const app = new Koa()
// 使用 KoaBody 中间件来解析请求体。可以处理 JSON、表单等格式。但这里没有启用文件上传功能（formidable 配置被注释掉了）。
app.use(KoaBody({ 
  multipart: true, // 允许上传文件
  // formidable: {
  //   //上传文件存储目录
  //   uploadDir:  path.join(__dirname, `/public/uploads/`),
  //   //允许保留后缀名
  //   keepExtensions: true,
  // },
  jsonLimit:'1mb', // 设置 JSON 数据大小限制为 1MB
  formLimit:'1mb', // 设置表单数据大小限制为 1MB
  textLimit:'1mb'  // 设置文本数据大小限制为 1MB
}));

// 使用 koa-static 中间件来提供静态文件服务，default ./public 作为静态资源目录。
app.use(StaticServer('public'));
app.use(userUserModel(mongoose,'/user2').router.routes());
// Koa-router 的 allowedMethods() 中间件可以根据路由的定义自动设置相应的 HTTP 状态码。
app.use(router.allowedMethods())

// 简单的中间件处理示例，所有的 GET 请求都会返回 "Hello, Koa with TypeScript! 12313132"。
// 这段代码位置需要注意：在 Koa 中中间件的执行顺序是从上到下。如果上面的中间件已经处理了某些请求，那么下面的中间件将不再执行。
// app.use(async (ctx) => {
//   console.log(getLocalServerIP());
//   ctx.body = 'Hello, Koa with TypeScript!';
// });

export default app; // 导出 Koa 实例，以便在其他地方使用或进行启动。