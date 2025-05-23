/**
 * @ Author: enmotion
 * @ Create Time: 2025-04-15 16:30:41
 * @ Modified by: Your name
 * @ Modified time: 2025-05-24 00:21:05
 * @ Description: Swagger API documentation configuration
 */
import { koaSwagger } from 'koa2-swagger-ui';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VMOX API Documentation',
      version: '1.0.0',
      description: 'API documentation for VMOX system',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:1980',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [path.join(__dirname, '../models/**/*.ts')], // 使用绝对路径扫描API文件
};

export const swaggerSpec = swaggerJSDoc(options);

export const swaggerMiddleware = koaSwagger({
  routePrefix: '/swagger', // Swagger UI 的访问路径
  swaggerOptions: {
    spec: swaggerSpec as Record<string, unknown>,
  },
  hideTopbar: true, // 隐藏顶部栏
}); 