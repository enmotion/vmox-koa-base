/**
 * @ Author: enmotion
 * @ Create Time: 2025-04-15 16:31:05
 * @ Modified time: 2025-04-28 15:46:26
 * @ Description: 该脚本用于启动服务器，加载环境变量，并输出服务器访问地址。
 */

// 引入 "colors" 库，该库用于在控制台输出有颜色的文本，方便区分不同类型的信息
import * as colors from "colors";
// 引入 dotenv 模块，用于加载环境变量文件
import dotenv from 'dotenv';
// 引入 path 模块，用于处理文件路径
import path from 'path';
// 引入应用实例，这个 app 应该是一个 Express 应用实例或者类似的服务器应用实例
import app from '../src/app';
// 从工具库模块中引入两个工具函数：getAvailablePort 用于获取可用端口，getLocalServerIP 用于获取本地服务器的 IP 地址
import { getAvailablePort, getLocalServerIP } from "../src/use.lib/serverTools";

// 获取当前的 NODE_ENV 环境变量，如果未设置则默认为 'production'
const nodeEnv = process.env.NODE_ENV || 'production';

// 根据不同的环境加载不同的环境变量文件
if (nodeEnv !== 'production') {
  // 在非生产环境中加载 .env 文件
  dotenv.config({ path: path.resolve(__dirname, `../.env`) });
  // 加载 .env.{NODE_ENV} 文件，并覆盖之前加载的环境变量
  dotenv.config({ path: path.resolve(__dirname, `../.env.${nodeEnv}`), override: true });
  // 加载 .env.{NODE_ENV}.local 文件，并覆盖之前加载的环境变量
  dotenv.config({ path: path.resolve(__dirname, `../.env.${nodeEnv}.local`), override: true });
} else {
  // 在生产环境中加载 .env 文件
  dotenv.config({ path: path.resolve(__dirname, `../.env`) });
}

// 尝试从环境变量中获取端口号。如果环境变量中没有 APP_PORT 字段，则使用默认值 '0'。
// 将获取到的端口号字符串转换为整数。如果转换失败（例如值为 '0' 或者非数字字符串），则使用默认端口号 3000
const port = parseInt(process.env.APP_PORT as string) || 3000;

/**
 * 异步函数，用于创建并启动服务器。
 * 根据当前的环境（开发环境或非开发环境）选择合适的端口，并启动服务器监听该端口。
 * 启动成功后，会在控制台输出服务器的访问地址信息。
 */
async function createServer() {
  try {
    // 判断当前是否为开发环境。如果不是开发环境，则直接使用之前从环境变量或默认值获取的端口号；
    // 如果是开发环境，则调用 getAvailablePort 函数来获取一个可用的端口号，最多尝试 10 次
    const usePort: number = process.env.NODE_ENV !== 'development' ? port : await getAvailablePort({ port: port, max: 10 });

    // 启动服务器，使其监听指定的端口
    const server = app.listen(usePort, async () => {
        // 调用 getLocalServerIP 函数，异步获取本地服务器的 IP 地址
        const localIP = await getLocalServerIP();

        // 打印一条由 50 个等号组成的灰色分隔线，用于在控制台中分隔不同的信息块，增强可读性
        console.log(colors.gray('='.repeat(50)));

        // 打印蓝色加粗的提示信息，表示服务器已成功启动
        console.log(colors.blue.bold('🚀 服务器已成功启动！'));

        // 打印绿色加粗的本地访问地址信息，告知用户可以通过本地的 localhost 地址和相应端口访问服务器
        console.log(colors.green.bold(`🌐 本地访问地址: `) + colors.green.bold(`http://localhost:${usePort}`));

        // 打印绿色加粗的局域网访问地址信息，告知用户可以通过局域网内的服务器 IP 地址和相应端口访问服务器
        console.log(colors.green.bold(`🌐 局域网访问地址: `) + colors.green.bold(`http://${localIP}:${usePort}`));

        // 再次打印一条由 50 个等号组成的灰色分隔线，用于结束当前的信息块
        console.log(colors.gray('='.repeat(50)));
    });

    // 监听服务器启动过程中的错误事件
    server.on('error', (error) => {
      // 打印一条由 50 个等号组成的红色分隔线，用于在控制台中分隔错误信息块，增强可读性
      console.log(colors.red('='.repeat(50)));

      // 打印红色加粗的错误提示信息，表示服务器启动失败
      console.log(colors.red.bold('❌ 服务器启动失败！'));

      // 打印红色的具体错误信息，帮助开发者定位问题
      console.log(colors.red(`错误详情: ${error.message}`));

      // 再次打印一条由 50 个等号组成的红色分隔线，用于结束当前的错误信息块
      console.log(colors.red('='.repeat(50)));
    });
  } catch (error) {
    // 打印一条由 50 个等号组成的红色分隔线，用于在控制台中分隔错误信息块，增强可读性
    console.log(colors.red('='.repeat(50)));

    // 打印红色加粗的错误提示信息，表示服务器启动失败
    console.log(colors.red.bold('❌ 服务器启动失败！'));

    // 打印红色的具体错误信息，帮助开发者定位问题
    console.log(colors.red(`错误详情: ${error}`));

    // 再次打印一条由 50 个等号组成的红色分隔线，用于结束当前的错误信息块
    console.log(colors.red('='.repeat(50)));
  }
}

// 调用 createServer 函数，启动服务器的创建和启动流程
createServer();