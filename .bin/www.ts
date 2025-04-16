/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:31:05
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 13:21:04
 * @ Description:
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
import { getAvailablePort, getLocalServerIP } from "../src/use.lib/tools";
/**
 * 确定当前的环境模式。
 * 尝试从 process.env 中获取 NODE_ENV 的值，如果没有设置，则默认使用 'production'。
 * 这是因为在生产环境中，通常会明确设置 NODE_ENV 为 'production'，而在开发环境中可能会省略该设置。
 */
const nodeEnv = process.env.NODE_ENV || 'production';

/**
 * 根据当前的环境模式确定要加载的环境变量文件的路径。
 * 如果当前环境不是 'production'，则加载根目录下的 .env 文件；
 * 否则，加载根目录下以 .env. 开头，后面跟着当前环境模式的文件，例如 .env.production。
 * path.resolve(__dirname, ...) 用于构建文件的绝对路径，确保在不同操作系统上都能正确找到文件。
 */
const envFilePath = nodeEnv !== 'production'
  ? path.resolve(__dirname, `../.env.${nodeEnv}`)
  : path.resolve(__dirname, `../.env`);
  
/**
 * 使用 dotenv 加载指定路径的环境变量文件。
 * 加载后，文件中的环境变量将被添加到 process.env 对象中。
 */
const result = dotenv.config({ path: envFilePath });
console.log(colors.gray('='.repeat(50)));
if (result.error) {
  // 打印一条由 50 个等号组成的红色分隔线，用于在控制台中分隔错误信息块，增强可读性
  console.log(colors.red('='.repeat(50)));
  // 打印红色加粗的错误提示信息，表示服务器启动失败
  console.log(colors.red.bold('❌ 环境变量信息文件读取失败'));
  // 打印红色的具体错误信息，帮助开发者定位问题
  console.log(colors.red(`错误详情: ${result.error}`));
  // 再次打印一条由 50 个等号组成的红色分隔线，用于结束当前的错误信息块
  console.log(colors.red('='.repeat(50)));
}else{
  console.log(colors.blue.bold('环境变量信息读取成功'));
  console.log('-'.repeat(20));
  for(let key in result.parsed){
    console.log(colors.white.bold(key)+":"+colors.white(result.parsed[key]));
  }
  console.log('-'.repeat(20));
}
// 尝试从环境变量中获取端口号。如果环境变量中没有 PORT 字段，则使用默认值 '0'。
// 将获取到的端口号字符串转换为整数。如果转换失败（例如值为 '0' 或者非数字字符串），则使用默认端口号 3000
const port = parseInt(process.env.PORT?? '0') || 3000;

/**
 * 异步函数，用于创建并启动服务器。
 * 根据当前的环境（开发环境或非开发环境）选择合适的端口，并启动服务器监听该端口。
 * 启动成功后，会在控制台输出服务器的访问地址信息。
 */
async function createServer() {
  try{
    // 判断当前是否为开发环境。如果不是开发环境，则直接使用之前从环境变量或默认值获取的端口号；
    // 如果是开发环境，则调用 getAvailablePort 函数来获取一个可用的端口号，最多尝试 12 次
    const usePort: number = process.env.NODE_ENV != 'development' ? port : await getAvailablePort({ port: port, max: 10 });

    // 启动服务器，使其监听指定的端口
    const server = app.listen(usePort, async () => {
        // 调用 getLocalServerIP 函数，异步获取本地服务器的 IP 地址
        const localIP = await getLocalServerIP();

        // 打印一条由 50 个等号组成的灰色分隔线，用于在控制台中分隔不同的信息块，增强可读性
        // console.log(colors.gray('='.repeat(50)));

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
      // console.log(colors.red('='.repeat(50)));

      // 打印红色加粗的错误提示信息，表示服务器启动失败
      console.log(colors.red.bold('❌ 服务器启动失败！'));

      // 打印红色的具体错误信息，帮助开发者定位问题
      console.log(colors.red(`错误详情: ${error.message}`));

      // 再次打印一条由 50 个等号组成的红色分隔线，用于结束当前的错误信息块
      console.log(colors.red('='.repeat(50)));
    });
  }catch(error){
     // 打印一条由 50 个等号组成的红色分隔线，用于在控制台中分隔错误信息块，增强可读性
    //  console.log(colors.red('='.repeat(50)));

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
