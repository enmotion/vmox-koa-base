import Koa from 'koa'; // koa 框架
import dotenv from 'dotenv'; // koa 环境变量插件
import path from 'path';
import { findAvailablePort } from '../use.lib/auto-port'; // 自动端口检测
import 'colors'; 

const envFile = path.resolve(__dirname,`../.env${ !!process.env.NODE_ENV ? '.'+process.env.NODE_ENV : ''}`) // 获取 .env 文件路径
dotenv.config({path:envFile}); // 加载 .env 文件
async function s(){
  const app = new Koa();
  // 中间件
  app.use(async (ctx) => {
    ctx.body = 'Hello, Koa with TypeScript!';
  });
  console.log(process.env.PORT);
  const port = await findAvailablePort(parseInt(process.env.PORT??'0') ?? 3000);

  app.listen(port, () => {
    console.log('======================================='.green.bold);
    console.log('🚀 Server is running!'.blue.bold);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
    console.log(`📡 Listening on: http://localhost:${port}`.cyan);
    console.log('======================================='.green.bold);
  });
}
s()