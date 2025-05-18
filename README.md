# vmox-koa-base

这是一个基于 Koa 框架的 Node.js 应用，支持 WebSocket、静态文件服务以及基于环境的配置。设计目标是模块化和易于维护。

---

## 目录

1. [项目结构](#项目结构)
2. [环境配置](#环境配置)
3. [安装步骤](#安装步骤)
4. [可用命令](#可用命令)
5. [开发说明](#开发说明)

---

## 项目结构

```
vmox-koa-base/
├── .bin/                # 应用程序入口文件
├── src/                 # 应用程序源代码
│   ├── app.ts           # Koa 应用主文件
│   ├── use.lib/         # 工具函数
├── public/              # 静态文件目录
├── .env                 # 默认环境变量文件
├── ecosystem.config.js  # PM2 配置文件
├── nodemon.json         # Nodemon 配置文件
├── tsconfig.json        # TypeScript 配置文件
├── package.json         # 项目依赖和脚本
└── README.md            # 项目文档
```

---

## 环境配置

项目使用 `dotenv` 管理环境变量，以下是配置文件的说明：

1. **`.env`**: 默认环境变量文件。
   ```
   APP_PORT = 1300
   APP_NAME = koa-base
   APP_VERSION = 0.0.0
   APP_DB_URL = ""
   APP_DB_PASSWORD = ""
   ```

2. **环境特定文件**:
   - `.env.development`: 开发环境的覆盖配置。
   - `.env.production`: 生产环境的覆盖配置。

3. **环境变量说明**:
   - `APP_PORT`: 应用运行的端口。
   - `APP_NAME`: 应用名称。
   - `APP_VERSION`: 应用版本。
   - `APP_DB_URL`: 数据库连接地址。
   - `APP_DB_PASSWORD`: 数据库密码。

4. **PM2 配置**:
   - 配置文件位于 `ecosystem.config.js`。
   - 包含 `NODE_ENV` 和 `PORT` 等环境变量的设置。

---

## 安装步骤

### 前置条件

- **Node.js**: 版本 16 或更高。
- **npm**: 版本 7 或更高。
- **TypeScript**: 全局安装（`npm install -g typescript`）。

### 安装

1. 克隆代码仓库：
   ```bash
   git clone https://github.com/your-repo/vmox-koa-base.git
   cd vmox-koa-base
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   - 复制 `.env` 文件并根据需要修改。
   - 开发环境下可创建 `.env.development` 和 `.env.development.local`。

---

## 可用命令

### 开发

1. **启动开发模式**：
   ```bash
   npm run dev
   ```
   - 使用 `nodemon` 监听文件变化。
   - 文件变更后自动重启服务。

2. **编译 TypeScript**：
   ```bash
   npm run build
   ```
   - 将 TypeScript 文件编译为 JavaScript，输出到 `dist/` 目录。

### 生产

1. **启动生产模式**：
   ```bash
   npm start
   ```
   - 运行 `dist/` 目录中的编译文件。

2. **使用 PM2 启动**：
   ```bash
   pm2 start ecosystem.config.js
   ```
   - 使用 PM2 启动应用，基于配置文件。

3. **监控 PM2 进程**：
   ```bash
   pm2 monit
   ```

4. **停止应用**：
   ```bash
   pm2 stop ecosystem.config.js
   ```

### 测试

1. **运行测试**（如适用）：
   ```bash
   npm test
   ```

---

## 开发说明

1. **静态文件**：
   - 静态文件存放于 `public/` 目录。
   - 使用 `koa-static` 中间件提供服务。

2. **WebSocket 支持**：
   - 项目通过 `koa-websocket` 提供 WebSocket 支持。

3. **动态端口分配**：
   - 开发模式下通过 `getAvailablePort` 工具动态分配端口。

4. **错误处理**：
   - 启动或运行时的错误会通过 `colors` 库以详细信息输出到控制台。

5. **TypeScript 配置**：
   - `tsconfig.json` 配置了跳过 `.d.ts` 文件的类型检查（`skipLibCheck`）。

---

## 常见问题

1. **端口冲突**：
   - 确保 `.env` 文件中指定的端口未被占用。
   - 使用 `getAvailablePort` 工具查找可用端口。

2. **环境变量未加载**：
   - 确保 `.env` 文件存在且格式正确。
   - 检查 `.bin/www.ts` 中的 `dotenv` 配置。

3. **PM2 问题**：
   - 确保全局安装了 PM2：`npm install -g pm2`。
   - 使用 `pm2 logs` 查看应用日志。

---

## 许可证

本项目基于 MIT 许可证。详见 `LICENSE` 文件。