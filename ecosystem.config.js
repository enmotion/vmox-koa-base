/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 18:06:29
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 18:15:28
 * @ Description:
 */
// 引入 dotenv 模块，用于加载环境变量文件
const colors = require('colors');
const dotenv = require('dotenv');
// 引入 path 模块，用于处理文件路径
const path = require('path');

/**
 * 使用 dotenv 加载指定路径的环境变量文件。
 * 加载后，文件中的环境变量将被添加到 process.env 对象中。
 */
const result = dotenv.config({ path: path.resolve(__dirname, `./dist/.env`) });
// 打印一条由 50 个等号组成的红色分隔线，用于在控制台中分隔错误信息块，增强可读性
console.log(colors.gray('='.repeat(50)));
if (result.error) {
  console.log(colors.red.bold('❌ 环境变量信息文件读取失败'));
  console.log(colors.red(`错误详情: ${result.error}`));
  console.log(colors.red('='.repeat(50)));
}else{
  console.log(colors.gray('-'.repeat(50)));
  console.log(colors.blue.bold(`🚀 启动环境变量:`));
  for(let k in result.parsed){
    console.log(`${colors.white.bold(`${k}:`)}${colors.green(`${result.parsed[k]}`)}`);
  }
  console.log(colors.gray('-'.repeat(50)));
}
/**
 * 导出 PM2 的配置对象。
 * PM2 是一个进程管理器，用于管理 Node.js 应用程序的运行。
 */
module.exports = {
  apps: [
    {
      /**
       * 应用程序的名称。
       * 尝试从 process.env 中获取 NAME 的值，如果没有设置，则默认使用 'koa'。
       * 这样可以根据环境变量动态设置应用名称，提高配置的灵活性。
       */
      name: process.env.NAME ?? 'koa',
      /**
       * 应用程序的入口脚本路径。
       * 这里指定为 ./dist/.bin/www.js，表示 PM2 将启动该脚本作为应用程序的入口。
       */
      script: './dist/.bin/www.js',
      /**
       * 应用程序的实例数量。
       * 设置为 1 表示只启动一个实例。
       */
      instances: 1,
      /**
       * 是否自动重启应用程序。
       * 设置为 true 表示当应用程序崩溃或退出时，PM2 会自动重启它。
       */
      autorestart: true,
      /**
       * 是否监听文件变化并自动重启应用程序。
       * 设置为 true 表示当应用程序的文件发生变化时，PM2 会自动重启应用。
       */
      watch: true,
      /**
       * 应用程序的环境变量配置。
       * 在这个对象中，可以设置应用程序运行时的环境变量。
       */
      env: {
        /**
         * 设置 NODE_ENV 环境变量为 'production'。
         * 这有助于应用程序在运行时根据环境模式做出不同的行为。
         */
        NODE_ENV: 'production',
        /**
         * 设置应用程序的端口号。
         * 尝试从 process.env 中获取 PORT 的值，如果没有设置，则默认使用 3000。
         * 这样可以根据环境变量动态设置应用程序的端口号。
         */
        PORT: process.env.PORT ?? 3000
      }
    }
  ]
};