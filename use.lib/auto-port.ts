import net from 'net';

/**
 * 检测端口是否可用
 * @param port 要检测的端口号
 * @returns Promise<boolean> 是否可用
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false); // 端口被占用
    });

    server.once('listening', () => {
      server.close();
      resolve(true); // 端口可用
    });

    server.listen(port);
  });
}

/**
 * 获取可用端口
 * @param startPort 起始端口号
 * @returns Promise<number> 可用端口号
 */
export async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++; // 如果端口被占用，递增端口号
  }
  return port;
}