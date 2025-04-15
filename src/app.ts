/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-15 18:04:40
 * @ Description:
 */
import Koa from 'koa';  // 引入 Koa 框架
const app = new Koa();  // 创建 Koa 实例
// 简单的中间件示例
app.use(async (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript22!';
});
export default app; // 导出 Koa 实例