/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 18:33:20
 * @ Description:
 */
import Koa from 'koa';  // 引入 Koa 框架
import { getLocalServerIP } from '@lib/tools';
const app = new Koa();  // 创建 Koa 实例

// 简单的中间件示例
app.use(async (ctx) => {
  console.log(getLocalServerIP())
  ctx.body = 'Hello, Koa with TypeScript!';
});
export default app; // 导出 Koa 实例