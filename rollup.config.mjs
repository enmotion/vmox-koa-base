import typescript from '@rollup/plugin-typescript'; // 引入 TypeScript 插件，用于处理 TypeScript 文件
import resolve from '@rollup/plugin-node-resolve'; // 引入 Node.js 解析插件，用于解析 node_modules 中的模块
import commonjs from '@rollup/plugin-commonjs'; // 引入 CommonJS 插件，用于将 CommonJS 模块转换为 ES6 模块
import { terser } from 'rollup-plugin-terser'; // 引入 Terser 插件，用于压缩 JavaScript 代码
import json from '@rollup/plugin-json'; // 引入 JSON 插件，用于导入 JSON 文件
import copy from 'rollup-plugin-copy'; // 引入 Copy 插件，用于在构建时复制文件
import alias from '@rollup/plugin-alias'; // 引入 Alias 插件，用于处理模块别名
import path from 'path'; // 引入 Node.js 的 path 模块，用于处理文件路径
import del from 'rollup-plugin-delete'; // 引入 Delete 插件，用于删除文件和目录
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default {
  input: '.bin/www.ts', // 指定入口文件
  output: {
    dir: 'dist', // 输出目录
    format: 'cjs', // 输出格式为 CommonJS
    sourcemap: false, // 禁止生成源映射文件
    preserveModules: true, // 保留模块结构
    preserveModulesRoot: '.', // 设置模块根目录
    exports: 'auto' // 设置导出方式为 auto
  },
  plugins: [
    del({ targets: 'dist/*', hook: 'buildStart' }), // 在构建开始时删除 dist 目录
    alias({
      entries: [
        { find: '@lib', replacement: path.resolve(__dirname, 'src/use.lib') }, // 别名 @lib 指向 src/use.lib
        { find: '@type', replacement: path.resolve(__dirname, 'src/type') }, // 别名 @type 指向 src/type
        { find: '@router', replacement: path.resolve(__dirname, 'src/router') } // 别名 @router 指向 src/router
      ]
    }),
    resolve({
      preferBuiltins: true // 优先使用 Node.js 内置模块
    }),
    commonjs(), // 转换 CommonJS 模块
    json(), // 处理 JSON 文件
    typescript({
      tsconfig: './tsconfig.rollup.json', // 指定 TypeScript 配置文件
      sourceMap: false // 禁止生成 TypeScript 源映射文件
    }),
    terser(), // 压缩代码
    copy({
      targets: [
        { src: 'src/ssl/**/*', dest: 'dist/ssl' }, // 拷贝 ssl 文件夹到 dist 目录
        { src: '.env', dest: 'dist' } // 拷贝 .env 文件到 dist 目录
      ]
    })
  ],
  external: [
    'path', 
    'fs', 
    'http', 
    'https',
    'crypto',
    'os',
    'net',
    'dns',
    'tls',
    'events',
    'stream',
    'url',
    'querystring',
    'zlib',
    'util',
    // 'koa', // 将 koa 作为外部依赖
    // 'koa-router', // 将 koa-router 作为外部依赖
    // 'dotenv', // 将 dotenv 作为外部依赖
    // 'koa-body', // 将 koa-body 作为外部依赖
    // 'koa-static', // 将 koa-static 作为外部依赖
    // 'koa-websocket', // 将 koa-websocket 作为外部依赖
    // 'colors', // 将 colors 作为外部依赖
    // 'detect-port' // 将 detect-port 作为外部依赖
  ]
};