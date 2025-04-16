/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 13:23:10
 * @ Description:
 */
import Koa from 'koa';  // 引入 Koa 框架
const app = new Koa();  // 创建 Koa 实例

// 简单的中间件示例
app.use(async (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript12!';
});
export default app; // 导出 Koa 实例