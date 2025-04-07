
/**
 * PM2配置文件
 * 使用PM2时，通常会创建一个名为ecosystem.config.js的配置文件，
 * 该文件用于配置PM2的应用程序管理器，
 * 使其能够在生产环境中运行和管理Node.js应用程序。
 * 该配置文件定义了应用程序的名称、脚本路径、实例数、自动重启、监视和环境变量等属性。
 * 该配置文件用于在生产环境中运行和管理Node.js应用程序
*/
module.exports = {
  apps: [
    {
      name: "vmox-koa-base", // 应用程序名称
      script: "./dist/app.js", // TypeScript 文件的入口
      instances: 1, // 实例数，设置为1表示单实例运行
      autorestart: true, // 自动重启应用程序
      watch: false, // 是否监视文件变化，设置为false表示不监视
      env: {
        NODE_ENV: "production",
        PORT: 3000, // 生产环境端口号
      }
    }
  ]
};