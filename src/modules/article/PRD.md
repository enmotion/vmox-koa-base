# 文章模块构建过程文档

## 1. 模块概述

文章模块是一个完整的文章管理系统，提供文章的创建、编辑、发布、分类、标签管理等功能。采用分层架构设计，支持富文本内容、多媒体资源、SEO优化等高级特性。

### 1.1 设计目标
- 提供完整的文章生命周期管理
- 支持多种内容格式（Markdown、富文本、HTML）
- 实现灵活的分类和标签系统
- 支持SEO优化和搜索引擎友好
- 提供内容版本控制和历史记录
- 支持多媒体资源管理

### 1.2 适用范围
- 博客系统
- 内容管理系统（CMS）
- 知识库系统
- 文档管理系统

## 2. 技术架构设计

### 2.1 分层架构
```
Article Module
├── Controller Layer (控制器层)
│   ├── 请求参数验证
│   ├── 响应数据封装
│   ├── 权限控制
│   └── 错误处理
├── Service Layer (服务层)
│   ├── 业务逻辑实现
│   ├── 数据操作封装
│   ├── 事务管理
│   └── 缓存策略
├── Model Layer (模型层)
│   ├── 数据结构定义
│   ├── 数据验证规则
│   ├── 数据库操作
│   └── 索引优化
└── Core Layer (核心层)
    ├── 基础服务类
    ├── 工具函数
    ├── 类型定义
    └── 常量配置
```

### 2.2 核心组件
- 文章模型（IArticle）
  - 基础字段定义
  - 内容字段定义
  - SEO字段定义
  - 状态字段定义
- 文章服务（ArticleService）
  - CRUD操作
  - 内容处理
  - 状态管理
  - 版本控制
- 文章控制器（ArticleController）
  - 接口实现
  - 参数验证
  - 响应处理
- 路由配置（ArticleRouter）
  - RESTful API设计
  - 权限控制
  - 中间件集成

## 3. 数据模型设计

### 3.1 基础字段
```typescript
interface IArticle {
  // 基础标识
  id: string;                    // 文章唯一标识
  title: string;                 // 文章标题
  slug: string;                  // URL友好的标题
  summary: string;               // 文章摘要
  content: string;               // 文章内容
  contentType: 'markdown' | 'html' | 'rich-text'; // 内容类型
  
  // 状态管理
  status: 'draft' | 'published' | 'archived'; // 发布状态
  isPublic: boolean;             // 是否公开
  isTop: boolean;                // 是否置顶
  isRecommend: boolean;          // 是否推荐
  
  // 分类标签
  categoryId: string;            // 分类ID
  tagIds: string[];              // 标签ID数组
  
  // 作者信息
  authorId: string;              // 作者ID
  authorName: string;            // 作者名称
  
  // SEO优化
  metaTitle: string;             // SEO标题
  metaDescription: string;       // SEO描述
  metaKeywords: string[];        // SEO关键词
  canonicalUrl: string;          // 规范链接
  
  // 统计信息
  viewCount: number;             // 浏览次数
  likeCount: number;             // 点赞次数
  commentCount: number;          // 评论次数
  shareCount: number;            // 分享次数
  
  // 时间戳
  publishedAt?: Date;            // 发布时间
  updatedAt: Date;               // 更新时间
  createdAt: Date;               // 创建时间
}
```

### 3.2 扩展字段
```typescript
interface IArticleExtend {
  // 封面图片
  coverImage: {
    url: string;                 // 图片URL
    alt: string;                 // 图片描述
    width: number;               // 图片宽度
    height: number;              // 图片高度
  };
  
  // 多媒体资源
  media: {
    images: Array<{
      url: string;
      alt: string;
      caption: string;
    }>;
    videos: Array<{
      url: string;
      title: string;
      duration: number;
    }>;
    attachments: Array<{
      url: string;
      name: string;
      size: number;
      type: string;
    }>;
  };
  
  // 版本控制
  version: {
    current: number;             // 当前版本号
    history: Array<{
      version: number;
      content: string;
      updatedAt: Date;
      updatedBy: string;
    }>;
  };
  
  // 高级设置
  settings: {
    allowComments: boolean;      // 允许评论
    requireApproval: boolean;    // 需要审核
    passwordProtected: boolean;  // 密码保护
    password?: string;           // 访问密码
    expiresAt?: Date;            // 过期时间
  };
}
```

## 4. 构建过程

### 4.1 第一阶段：基础架构搭建

#### 4.1.1 创建目录结构
```bash
src/modules/article/
├── core/
│   ├── schema.ts          # 数据模型定义
│   ├── service.ts         # 业务逻辑服务
│   ├── controller.ts      # 控制器实现
│   └── types.ts           # 类型定义
├── expand/
│   ├── schema.ts          # 扩展模型定义
│   ├── service.ts         # 扩展业务逻辑
│   └── controller.ts      # 扩展控制器
├── index.ts               # 模块入口文件
└── PRD.md                 # 产品需求文档
```

#### 4.1.2 定义基础类型
```typescript
// core/types.ts
export interface IArticle {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';
```

#### 4.1.3 创建数据模型
```typescript
// core/schema.ts
import { Schema } from 'mongoose';
import { IArticle } from './types';

export const articleSchemaConfig: SchemaDefinition<IArticle> = {
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  authorId: {
    type: String,
    required: true,
    index: true
  }
};
```

### 4.2 第二阶段：业务逻辑实现

#### 4.2.1 服务层实现
```typescript
// core/service.ts
import { CoreService } from 'src/frame-work-core/service';
import { IArticle } from './types';

export class ArticleService<T extends IArticle> extends CoreService<T> {
  
  // 创建文章
  async createArticle(data: Partial<T>): Promise<T> {
    // 业务逻辑实现
  }
  
  // 发布文章
  async publishArticle(id: string): Promise<T> {
    // 发布逻辑实现
  }
  
  // 获取文章列表
  async getArticleList(filters: any, options: any): Promise<T[]> {
    // 查询逻辑实现
  }
  
  // 更新文章
  async updateArticle(id: string, data: Partial<T>): Promise<T> {
    // 更新逻辑实现
  }
  
  // 删除文章
  async deleteArticle(id: string): Promise<boolean> {
    // 删除逻辑实现
  }
}
```

#### 4.2.2 控制器层实现
```typescript
// core/controller.ts
import { CoreController } from 'src/frame-work-core/controller';
import { ArticleService } from './service';
import { IArticle } from './types';

export class ArticleController<T extends IArticle> extends CoreController<T> {
  
  constructor(
    private articleService: ArticleService<T>,
    private schema: Schema<T>
  ) {
    super(articleService, schema);
  }
  
  // 创建文章
  async create(ctx: Context): Promise<void> {
    // 控制器实现
  }
  
  // 发布文章
  async publish(ctx: Context): Promise<void> {
    // 发布接口实现
  }
  
  // 获取文章列表
  async list(ctx: Context): Promise<void> {
    // 列表接口实现
  }
}
```

### 4.3 第三阶段：扩展功能实现

#### 4.3.1 分类标签集成
```typescript
// 与content-type模块集成
import { categoryService, tagService } from '../content-type';

export class ArticleService<T extends IArticle> {
  
  // 获取文章分类
  async getArticleCategory(articleId: string) {
    const article = await this.findById(articleId);
    return await categoryService.findById(article.categoryId);
  }
  
  // 获取文章标签
  async getArticleTags(articleId: string) {
    const article = await this.findById(articleId);
    return await tagService.findMany({ _id: { $in: article.tagIds } });
  }
}
```

#### 4.3.2 SEO优化功能
```typescript
// SEO相关方法
export class ArticleService<T extends IArticle> {
  
  // 生成SEO友好的URL
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // 更新SEO信息
  async updateSEO(id: string, seoData: any): Promise<T> {
    // SEO更新逻辑
  }
}
```

### 4.4 第四阶段：路由配置

#### 4.4.1 路由映射
```typescript
// index.ts
export const articleRouter = mappingControllersAndRouter<ArticleController<IArticle>>(
  '/articles',
  articleController,
  [
    // 基础CRUD
    { routerPath: '/', method: 'post', handlerName: 'create' },
    { routerPath: '/', method: 'get', handlerName: 'findOne' },
    { routerPath: '/list', method: 'post', handlerName: 'aggregate' },
    { routerPath: '/', method: 'put', handlerName: 'updateOne' },
    { routerPath: '/', method: 'delete', handlerName: 'deleteMany' },
    
    // 扩展功能
    { routerPath: '/publish', method: 'put', handlerName: 'publish' },
    { routerPath: '/unpublish', method: 'put', handlerName: 'unpublish' },
    { routerPath: '/top', method: 'put', handlerName: 'setTop' },
    { routerPath: '/recommend', method: 'put', handlerName: 'setRecommend' },
    
    // 统计功能
    { routerPath: '/view', method: 'put', handlerName: 'incrementView' },
    { routerPath: '/like', method: 'put', handlerName: 'incrementLike' },
    
    // 公共接口
    { routerPath: '/pub/list', method: 'post', handlerName: 'getPublicList' },
    { routerPath: '/pub/detail', method: 'get', handlerName: 'getPublicDetail' }
  ]
);
```

## 5. API接口设计

### 5.1 基础CRUD接口

#### 5.1.1 创建文章
- **接口**: `POST /articles/`
- **描述**: 创建新文章
- **请求参数**:
```json
{
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "categoryId": "分类ID",
  "tagIds": ["标签ID1", "标签ID2"],
  "status": "draft",
  "isPublic": true
}
```
- **响应数据**:
```json
{
  "code": 200,
  "data": {
    "id": "文章ID",
    "title": "文章标题",
    "status": "draft",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "msg": "创建成功"
}
```

#### 5.1.2 获取文章列表
- **接口**: `POST /articles/list`
- **描述**: 获取文章列表（支持分页、筛选）
- **请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "filters": {
    "status": "published",
    "categoryId": "分类ID",
    "authorId": "作者ID"
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  }
}
```

### 5.2 扩展功能接口

#### 5.2.1 发布文章
- **接口**: `PUT /articles/publish`
- **描述**: 将草稿文章发布
- **请求参数**:
```json
{
  "id": "文章ID",
  "publishedAt": "2025-01-01T00:00:00.000Z"
}
```

#### 5.2.2 文章统计
- **接口**: `PUT /articles/view`
- **描述**: 增加文章浏览次数
- **请求参数**:
```json
{
  "id": "文章ID"
}
```

## 6. 性能优化策略

### 6.1 数据库优化
- 创建复合索引：`{ authorId: 1, status: 1, createdAt: -1 }`
- 创建分类索引：`{ categoryId: 1, status: 1 }`
- 创建标签索引：`{ tagIds: 1 }`
- 创建状态索引：`{ status: 1, publishedAt: -1 }`

### 6.2 缓存策略
- 热门文章缓存
- 分类文章列表缓存
- 标签文章列表缓存
- 文章详情缓存

### 6.3 查询优化
- 使用聚合管道进行复杂查询
- 实现分页查询优化
- 支持全文搜索
- 懒加载关联数据

## 7. 安全考虑

### 7.1 权限控制
- 作者只能操作自己的文章
- 管理员可以操作所有文章
- 公开文章访问权限控制
- 敏感内容访问限制

### 7.2 内容安全
- XSS防护
- SQL注入防护
- 文件上传安全
- 内容审核机制

### 7.3 数据验证
- 输入参数严格验证
- 内容长度限制
- 文件类型限制
- 特殊字符过滤

## 8. 测试策略

### 8.1 单元测试
- 服务层方法测试
- 控制器方法测试
- 数据模型验证测试
- 工具函数测试

### 8.2 集成测试
- API接口测试
- 数据库操作测试
- 权限控制测试
- 错误处理测试

### 8.3 性能测试
- 并发访问测试
- 大数据量查询测试
- 缓存效果测试
- 内存使用测试

## 9. 部署和维护

### 9.1 部署配置
- 环境变量配置
- 数据库连接配置
- 缓存服务配置
- 文件存储配置

### 9.2 监控指标
- API响应时间
- 数据库查询性能
- 缓存命中率
- 错误率统计

### 9.3 日志管理
- 操作日志记录
- 错误日志记录
- 性能日志记录
- 安全日志记录

## 10. 总结

文章模块采用现代化的分层架构设计，具有良好的可扩展性和维护性。通过合理的数据库设计、缓存策略和性能优化，能够支持高并发的文章管理需求。模块化的设计使得功能扩展和定制变得简单，同时保证了代码的质量和安全性。

该模块可以作为内容管理系统的核心组件，为博客、知识库、文档系统等应用提供强大的文章管理能力。 