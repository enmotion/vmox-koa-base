import Koa from 'koa'; // koa 框架
import os from 'os'; // os 模块用于获取本机 IP 地址
import dotenv from 'dotenv'; // koa 环境变量插件
import path from 'path';
import { getAvailablePort } from './auto-port'; // 自动端口检测
import 'colors'; 

const envFile = path.resolve(__dirname,`../.env${ !!process.env.NODE_ENV ? '.'+process.env.NODE_ENV : ''}`) // 获取 .env 文件路径
dotenv.config({path:envFile}); // 加载 .env 文件
async function s(){
  function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address; // 返回第一个非内部的 IPv4 地址
        }
      }
    }
    return '127.0.0.1'; // 如果没有找到，返回 localhost
  }
  const app = new Koa();
  // 中间件
  app.use(async (ctx) => {
    ctx.body = 'Hello, Koa with TypeScript!';
  });
  const port = await getAvailablePort({defaultPort: Number(process.env.PORT) || 3000, maxAttempts: 5}); // 获取可用端口

  app.listen(port, () => {
    console.log('======================================='.green.bold);
    console.log('🚀 Server is running!'.blue.bold);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`.yellow);
    console.log(`📡 Listening on: http://${getLocalIP()}:${port}`.cyan);
    console.log('======================================='.green.bold);
  });
}
s()