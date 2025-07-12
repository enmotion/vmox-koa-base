'use strict';
// 引入 path 模块，用于处理文件路径
import path from 'path';
// 引入 dotenv 模块，用于加载环境变量文件
import dotenv from 'dotenv';
// 获取当前的 NODE_ENV 环境变量，如果未设置则默认为 'production'
const nodeEnv = process.env.NODE_ENV || 'production';
// 根据不同的环境加载不同的环境变量文件
if (nodeEnv !== 'production') {
  // 在非生产环境中加载 .env 文件
  dotenv.config({ path: path.resolve(__dirname, `../../.env`) });
  // 加载 .env.{NODE_ENV} 文件，并覆盖之前加载的环境变量
  dotenv.config({ path: path.resolve(__dirname, `../../.env.${nodeEnv}`), override: true });
  // 加载 .env.{NODE_ENV}.local 文件，并覆盖之前加载的环境变量
  dotenv.config({ path: path.resolve(__dirname, `../../.env.${nodeEnv}.local`), override: true });
} else {
  // 在生产环境中加载 .env 文件
  dotenv.config({ path: path.resolve(__dirname, `../../.env`) });
}