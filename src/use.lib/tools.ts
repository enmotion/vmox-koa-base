/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:07:22
 * @ Modified by: Your name
 * @ Modified time: 2025-04-16 11:44:28
 * @ Description:
 */

import detect from "detect-port"; // detect-port 是一个用于检测端口是否可用的库
import os from "os"; // os 模块用于获取本机 IP 地址

/**
 * 异步函数，用于查找可用的端口。
 * 它会从指定的端口开始尝试，最多尝试指定的次数，直到找到一个可用的端口。
 * 
 * @param {PortConfig} config - 包含端口查找配置的对象。
 * @param {number} config.port - 开始查找的起始端口。
 * @param {number} [config.max = 5] - 最大尝试次数，默认为 5 次。
 * @returns {Promise<number>} 返回一个 Promise，当找到可用端口时，Promise 会 resolve 该端口号；如果未找到可用端口，Promise 会 reject 并抛出错误。
 */
interface PortConfig {
  port: number;
  max?: number;
}
async function getAvailablePort(config: PortConfig): Promise<number> {
  // 从传入的 config 对象中解构出 port 和 max 属性，
  // 如果 config 对象中没有提供 max 属性，则将其默认值设置为 5
  let { port, max = 5 } = config;
  // 初始化当前尝试次数为 0
  let currentAttempt = 0;
  /**
   * 进入循环，只要当前尝试次数小于最大尝试次数，就继续尝试查找可用端口。
   * 每次循环都会检查一个新的端口，直到找到可用端口或者达到最大尝试次数。
   */
  while (currentAttempt < max) {
      try {
          // 调用 detect 函数（此函数应是自定义的用于检测端口是否可用的函数），
          // 并传入当前要检测的端口号，等待检测结果
          const p = await detect(port);
          // 如果 detect 函数返回的端口号与当前检测的端口号相同，
          // 说明该端口可用，直接返回该端口号
          if (p === port) return p;
          // 如果当前端口不可用，将端口号加 1，准备检测下一个端口
          port++;
          // 增加当前尝试次数
          currentAttempt++;
      } catch (err) {
          // 如果在调用 detect 函数的过程中发生错误，
          // 抛出一个新的错误，包含错误信息 "Port detection failed:" 以及具体的错误内容
          throw new Error(`Port detection failed: ${err}`);
      }
  }
  // 如果达到最大尝试次数后仍然没有找到可用端口，
  // 抛出一个新的错误，提示在指定的尝试次数后没有找到可用端口
  throw new Error(`No available ports found after ${max} attempts`);
}

/**
 * 获取本地服务器的非内部 IPv4 地址。
 * 如果找到非内部的 IPv4 地址，则返回该地址；
 * 如果未找到符合条件的地址，则返回本地回环地址 "127.0.0.1"。
 * 
 * @returns {string} 本地服务器的非内部 IPv4 地址或本地回环地址。
 */
function getLocalServerIP(): string {
  // 调用 os 模块的 networkInterfaces 方法，获取当前机器的所有网络接口信息。
  // 返回的结果是一个对象，键为网络接口的名称，值为该接口对应的地址信息数组。
  const interfaces = os.networkInterfaces();
  // 使用 for...of 循环遍历 interfaces 对象的所有键，即网络接口的名称
  for (const name of Object.keys(interfaces)) {
      // 对于每个网络接口名称，获取该接口对应的地址信息数组。
      // 如果该接口没有地址信息，则使用空数组 [] 作为默认值。
      // 然后使用 for...of 循环遍历该接口的所有地址信息。
      for (const iface of interfaces[name] || []) {
          // 检查当前地址的 family 属性是否为 "IPv4"，表示该地址是 IPv4 类型。
          // 同时检查 internal 属性是否为 false，意味着该地址不是内部（本地回环）地址。
          if (iface.family === "IPv4" && !iface.internal) {
              // 如果满足上述两个条件，说明找到了一个非内部的 IPv4 地址，
              // 立即返回该地址。
              return iface.address; 
          }
      }
  }
  // 如果遍历完所有网络接口和地址后，仍然没有找到符合条件的非内部 IPv4 地址，
  // 则返回本地回环地址 "127.0.0.1"。
  return "127.0.0.1"; 
}

export {
  getAvailablePort,
  getLocalServerIP
}
