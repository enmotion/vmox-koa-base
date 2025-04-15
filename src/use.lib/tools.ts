/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:07:22
 * @ Modified by: Your name
 * @ Modified time: 2025-04-15 16:55:00
 * @ Description:
 */

import detect from 'detect-port'; // detect-port 是一个用于检测端口是否可用的库
import os from 'os'; // os 模块用于获取本机 IP 地址
/**
 * 接口定义：PortConfig
 * 用于配置端口检测的参数
 * @property {number} expectPort - 起始检测的默认端口
 * @property {number} [maxTry] - 最大尝试次数（可选，默认为 5）
 */
interface PortConfig {
  port: number;
  max?: number;
}

/**
 * 异步函数：getAvailablePort
 * 检测并返回一个可用的端口
 * @param {PortConfig} config - 包含默认端口和最大尝试次数的配置对象
 * @returns {Promise<number>} - 返回一个 Promise，解析为可用的端口号
 * @throws {Error} - 如果在最大尝试次数内未找到可用端口，则抛出错误
 */
export async function getAvailablePort(config: PortConfig): Promise<number> {
  let { port, max = 5 } = config; // 解构配置对象，设置默认值
  let currentAttempt = 0; // 当前尝试次数

  // 循环检测端口，直到找到可用端口或达到最大尝试次数
  while (currentAttempt < max) {
    try {
      const p = await detect(port); // 检测当前端口是否可用
      if (p === port) return p; // 如果端口可用，直接返回
      port++; // 如果端口不可用，尝试下一个端口
      currentAttempt++; // 增加尝试次数
    } catch (err) {
  // 如果检测过程中发生错误，抛出异常
      throw new Error(`Port detection failed: ${err}`);
    }
  }

// 如果达到最大尝试次数仍未找到可用端口，抛出错误
  throw new Error(`No available ports found after ${max} attempts`);
}

export function getLocalIP(): string {
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
