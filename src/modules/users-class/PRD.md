# 用户模块产品需求文档

## 1. 模块概述

用户模块是一个完整的用户管理系统，提供用户注册、登录、信息管理等基础功能。采用分层架构设计，支持基础功能和扩展功能的灵活组合。

### 1.1 设计目标
- 提供完整的用户生命周期管理
- 支持灵活的权限控制
- 确保数据安全和访问控制
- 提供良好的扩展性

### 1.2 适用范围
- 系统用户管理
- 权限控制
- 用户信息维护
- 用户行为审计

## 2. 功能特性

### 2.1 核心功能
- 用户注册
  - 支持用户名密码注册
  - 支持管理员创建
  - 自动生成唯一标识
- 用户登录
  - 支持用户名/昵称登录
  - 记录登录次数
  - 生成JWT令牌
- 基础信息管理
  - 用户状态控制
  - 权限版本管理
  - 超级管理员标识

### 2.2 扩展功能
- 用户昵称管理
  - 支持自定义昵称
  - 昵称唯一性校验
- 头像管理
  - 支持头像URL存储
  - 支持头像更新
- 联系方式管理
  - 手机号码验证
  - 邮箱地址验证
  - 联系方式唯一性校验
- 年龄信息管理
  - 年龄范围限制
  - 年龄信息更新

## 3. 技术架构

### 3.1 分层设计
- Controller层
  - 请求参数验证
  - 响应数据封装
  - 错误处理
- Service层
  - 业务逻辑实现
  - 数据操作封装
  - 事务管理
- Model层
  - 数据结构定义
  - 数据验证规则
  - 数据库操作

### 3.2 核心组件
- 基础用户模型（IUser）
  - 核心字段定义
  - 基础验证规则
- 扩展用户模型（ExpandUser）
  - 扩展字段定义
  - 扩展验证规则
- 统一响应处理
  - 成功响应格式
  - 错误响应格式
- 错误处理机制
  - 业务错误处理
  - 系统错误处理

## 4. 数据模型

### 4.1 基础字段
- uid: 用户唯一标识
  - 类型：String
  - 自动生成
  - 不可修改
- username: 登录账号
  - 类型：String
  - 必填
  - 唯一性约束
- password: 密码
  - 类型：String
  - 必填
  - 最小长度8位
  - 加密存储
- status: 用户状态
  - 类型：Boolean
  - 默认值：true
- loginCount: 登录次数
  - 类型：Number
  - 默认值：0
  - 自动递增
- powVersion: 权限版本
  - 类型：Number
  - 默认值：0
- isSuper: 超级管理员标识
  - 类型：Boolean
  - 默认值：false
- createdType: 创建方式
  - 类型：String
  - 枚举值：['register', 'admin']
  - 默认值：'register'

### 4.2 扩展字段
- nickname: 用户昵称
  - 类型：String
  - 可选
  - 唯一性约束
- avatar: 用户头像
  - 类型：String
  - 可选
  - URL格式
- phone: 手机号码
  - 类型：Object
  - 可选
  - 唯一性约束
  - 格式验证
- email: 电子邮箱
  - 类型：String
  - 可选
  - 唯一性约束
  - 格式验证
- age: 年龄
  - 类型：Number
  - 可选
  - 最小值：0

## 5. API接口

### 5.1 公共接口

#### 5.1.1 用户登录
- 接口：POST /users/pub/login
- 描述：用户登录接口
- 请求参数：
  ```json
  {
    "username": "string", // 用户名或昵称
    "password": "string"  // 密码
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "uid": "string",
      "username": "string",
      "nickname": "string",
      "token": "string",
      "loginCount": 0
    },
    "msg": "登录成功"
  }
  ```
- 错误码：
  - 400: 用户名或密码错误
  - 401: 用户已被禁用

#### 5.1.2 用户注册
- 接口：POST /users/pub/register
- 描述：用户注册接口
- 请求参数：
  ```json
  {
    "username": "string",  // 用户名
    "password": "string",  // 密码
    "nickname": "string",  // 昵称（可选）
    "phone": "string",     // 手机号（可选）
    "email": "string",     // 邮箱（可选）
    "age": 0              // 年龄（可选）
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "uid": "string",
      "username": "string",
      "nickname": "string"
    },
    "msg": "注册成功"
  }
  ```
- 错误码：
  - 400: 参数验证失败
  - 409: 用户名已存在

### 5.2 管理接口

#### 5.2.1 创建用户
- 接口：POST /users/create
- 描述：管理员创建用户
- 请求参数：
  ```json
  {
    "username": "string",
    "password": "string",
    "nickname": "string",
    "phone": "string",
    "email": "string",
    "age": 0,
    "status": true,
    "isSuper": false
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "uid": "string",
      "username": "string",
      "nickname": "string"
    },
    "msg": "创建成功"
  }
  ```

#### 5.2.2 创建或更新用户
- 接口：POST /users/createOrUpdate
- 描述：创建新用户或更新现有用户
- 请求参数：
  ```json
  {
    "uid": "string",      // 更新时必填
    "username": "string", // 创建时必填
    "password": "string", // 创建时必填
    "nickname": "string",
    "phone": "string",
    "email": "string",
    "age": 0,
    "status": true
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "uid": "string",
      "username": "string",
      "nickname": "string"
    },
    "msg": "操作成功"
  }
  ```

#### 5.2.3 删除用户
- 接口：DELETE /users/delete
- 描述：删除指定用户
- 请求参数：
  ```json
  {
    "uid": "string,string" // 支持多个uid，用逗号分隔
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "deletedCount": 0
    },
    "msg": "删除成功"
  }
  ```

#### 5.2.4 更新用户
- 接口：PUT /users/update
- 描述：更新单个用户信息
- 请求参数：
  ```json
  {
    "uid": "string",
    "nickname": "string",
    "phone": "string",
    "email": "string",
    "age": 0,
    "status": true
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "matchedCount": 1,
      "modifiedCount": 1
    },
    "msg": "更新成功"
  }
  ```

#### 5.2.5 批量更新用户
- 接口：PUT /users/updateMany
- 描述：批量更新用户信息
- 请求参数：
  ```json
  {
    "uids": ["string"],
    "nickname": "string",
    "phone": "string",
    "email": "string",
    "age": 0,
    "status": true
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "matchedCount": 0,
      "modifiedCount": 0
    },
    "msg": "更新成功"
  }
  ```

#### 5.2.6 查询单个用户
- 接口：GET /users/findOne
- 描述：查询单个用户信息
- 请求参数：
  ```json
  {
    "uid": "string",
    "username": "string",
    "nickname": "string",
    "phone": "string",
    "email": "string"
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "uid": "string",
      "username": "string",
      "nickname": "string",
      "phone": "string",
      "email": "string",
      "age": 0,
      "status": true,
      "loginCount": 0,
      "createdAt": "string",
      "updatedAt": "string"
    },
    "msg": "查询成功"
  }
  ```

#### 5.2.7 分页查询用户列表
- 接口：POST /users/find
- 描述：分页查询用户列表
- 请求参数：
  ```json
  {
    "page": {
      "current": 1,
      "size": 10
    },
    "sort": {
      "field": "createdAt",
      "order": "desc"
    },
    "username": "string",
    "nickname": "string",
    "status": true
  }
  ```
- 响应数据：
  ```json
  {
    "code": 200,
    "data": {
      "items": [{
        "uid": "string",
        "username": "string",
        "nickname": "string",
        "phone": "string",
        "email": "string",
        "age": 0,
        "status": true,
        "loginCount": 0,
        "createdAt": "string",
        "updatedAt": "string"
      }],
      "total": 0
    },
    "msg": "查询成功"
  }
  ```

## 6. 安全特性

### 6.1 数据安全
- 密码加密存储
  - 使用bcrypt加密
  - 密码不可明文传输
- 敏感字段查询过滤
  - 密码字段默认不返回
  - 敏感信息脱敏处理
- 唯一性约束保护
  - 用户名唯一
  - 手机号唯一
  - 邮箱唯一
  - 昵称唯一

### 6.2 访问控制
- 超级管理员权限控制
  - 超级管理员标识
  - 权限版本管理
- 操作审计日志
  - 记录操作人
  - 记录操作时间
  - 记录操作类型
- 权限版本管理
  - 版本号控制
  - 权限变更追踪

## 7. 扩展性设计

### 7.1 模块扩展
- 支持通过继承扩展基础功能
  - 基础用户模型继承
  - 基础服务层继承
  - 基础控制器继承
- 可自定义扩展字段
  - 字段类型扩展
  - 验证规则扩展
  - 业务逻辑扩展
- 支持自定义业务逻辑
  - 服务层方法扩展
  - 控制器方法扩展
  - 路由配置扩展

### 7.2 接口扩展
- RESTful API设计
  - 资源化URL设计
  - HTTP方法语义化
  - 状态码规范化
- 统一的响应格式
  - 成功响应格式
  - 错误响应格式
  - 分页响应格式
- 支持自定义路由配置
  - 路由前缀配置
  - 路由方法配置
  - 路由处理器配置

## 8. 性能优化

### 8.1 数据库优化
- 索引优化
  - 唯一索引
  - 复合索引
  - 稀疏索引
- 查询性能优化
  - 字段选择
  - 查询条件优化
  - 排序优化
- 分页查询支持
  - 游标分页
  - 偏移分页
  - 性能优化

### 8.2 代码优化
- 类型安全
  - TypeScript类型定义
  - 接口定义
  - 泛型支持
- 错误处理
  - 统一错误处理
  - 错误类型定义
  - 错误信息国际化
- 代码复用
  - 工具函数封装
  - 中间件复用
  - 组件复用

## 9. 注意事项

### 9.1 开发规范
- 严格类型检查
  - 启用strict模式
  - 避免any类型
  - 使用类型断言
- 统一的错误处理
  - 错误码定义
  - 错误信息规范
  - 错误处理流程
- 完整的注释文档
  - 接口文档
  - 类型定义
  - 业务逻辑

### 9.2 使用限制
- 密码长度限制
  - 最小长度：8位
  - 复杂度要求
  - 定期更换
- 唯一性约束
  - 用户名唯一
  - 昵称唯一
  - 手机号唯一
  - 邮箱唯一
- 年龄范围限制
  - 最小值：0
  - 最大值：150
  - 整数类型

## 10. 未来规划

### 10.1 功能增强
- 支持更多用户属性
  - 地址信息
  - 个人简介
  - 兴趣爱好
- 增强权限管理
  - 角色管理
  - 权限组
  - 数据权限
- 添加更多业务场景
  - 第三方登录
  - 手机验证码
  - 邮箱验证

### 10.2 性能提升
- 缓存机制
  - Redis缓存
  - 本地缓存
  - 缓存策略
- 查询优化
  - 索引优化
  - 查询计划
  - 数据分片
- 并发处理
  - 异步处理
  - 队列处理
  - 分布式处理 