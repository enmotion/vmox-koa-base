import Koa from 'koa';
import dotenv from 'dotenv'; // koa 环境变量插件
dotenv.config(); // 加载 .env 文件

const app = new Koa();

// 中间件
app.use(async (ctx) => {
  ctx.body = 'Hello, Koa with TypeScript!';
});

const port = process.env.PORT || 3000;
console.log(process.env.NODE_ENV); // 打印当前环境变量
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});