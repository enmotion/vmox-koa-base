/*
 * @Author: enmotion
 * @Date: 2025-04-29 08:50:46
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 10:36:38
 *
 * 服务内核模块 - 提供基于Mongoose的文档CRUD操作
 * 使用泛型T扩展自Idoc接口，确保类型安全
 */
'use strict'
import * as R from 'ramda'
import MongoDB from 'mongodb'
import { mongoDBErrorTransform } from '@lib/serviceTools'
import type { Page, Sort } from '@lib/serviceTools'
import type {
  Model,
  SaveOptions,
  QueryOptions,
  ProjectionType,
  RootFilterQuery,
  MongooseUpdateQueryOptions,
  MongooseBaseQueryOptions,
  PipelineStage,
  AggregateOptions
} from 'mongoose'

/**
 * @class CoreService
 * @classdesc 抽象核心服务层 - 封装通用 CRUD 操作及统一配置的基类
 * @template T - 泛型参数，代表 Mongoose 文档结构类型，需继承自键值对对象 `Record<string, any>`
 *
 * @description
 * 该服务类旨在为 Koa + Mongoose 应用提供基础 CRUD 操作的统一封装层。通过继承此类，
 * 子类可复用预置的数据库操作方法，同时确保项目级别的统一配置（如默认查询条件、字段过滤、钩子函数等）。
 * 典型使用场景包括自动添加时间戳、软删除标记、权限过滤等全局逻辑。
 *
 * @example
 * // 子类示例 - 用户服务继承核心类
 * class UserService extends CoreService<User> {
 *   constructor() {
 *     super(userModel); // 传入用户模型实例
 *   }
 *
 *   // 可扩展或重写基类方法，添加业务逻辑
 *   public async findActiveUsers() {
 *     return this.model.find({ isActive: true }); // 复用基类模型实例
 *   }
 * }
 */
export class CoreService<T extends Record<string, any>> {
  /**
   * @public
   * @description 内部持有的 Mongoose 模型实例，用于直接操作数据库集合
   * @remarks 通过此属性可调用 Mongoose 原生方法，如 find()、create() 等
   */
  public model: Model<T>
  public immutableKeys: string[]
  /**
   * @constructor
   * @param {Model<T>} model - 需要注入的 Mongoose 数据模型实例
   * @description 初始化服务时需传入与泛型类型匹配的 Mongoose 模型
   *
   * @example
   * // 在控制器或路由中初始化服务
   * const userModel = mongoose.model('User', userSchema);
   * const userService = new UserService(userModel);
   */
  public constructor(model: Model<T>) {
    this.model = model
    this.immutableKeys = Object.keys(this.model.schema.paths)
      .map(key => key)
      .filter(key => !!this.model.schema.path(key).options.immutable)
  }
  /**
   * 创建并保存文档到数据库
   * @param doc 要保存的文档数据对象（需符合Model的Schema定义）
   * @param options 保存配置选项（可选），包含以下属性：
   *   - checkKeys?: boolean
   *     含义：是否检查文档键名中的非法字符（如 . 或 $）
   *     场景：当需要插入包含 . 或 $ 的键名时（如兼容旧系统），设为 false 可绕过检查
   *     注意：MongoDB 本身禁止这些字符，除非特殊场景否则不建议禁用，可能导致数据库错误
   *
   *   - j?: boolean
   *     含义：是否等待 MongoDB 的 journal 持久化写入（写操作日志）
   *     场景：需要确保数据在服务器崩溃后不丢失（如金融交易场景）
   *     注意：启用后会显著降低写入性能，需权衡持久性和性能
   *
   *   - safe?: boolean | WriteConcern
   *     含义：写关注级别（write concern）的别名配置
   *     场景：旧版本兼容配置，新版建议直接用 w 和 wtimeout 替代
   *     注意：若同时设置 w 和 safe 可能产生冲突，优先使用 w 参数
   *
   *   - timestamps?: boolean | QueryTimestampsConfig
   *     含义：是否自动管理时间戳（createdAt/updatedAt）
   *     场景：当需要临时覆盖 Schema 中的 timestamps 配置时
   *     注意：若传对象 { createdAt: false } 可禁用特定字段的自动更新
   *
   *   - validateBeforeSave?: boolean
   *     含义：保存前是否执行 Schema 校验
   *     场景：需要跳过校验保存无效数据时（如临时存储中间状态）
   *     注意：禁用校验可能导致数据库存在无效数据，建议配合手动 validate()
   *
   *   - validateModifiedOnly?: boolean
   *     含义：是否仅校验被修改的字段
   *     场景：提升大型文档保存性能（仅检查改动字段而非全文档）
   *     注意：需确保未修改字段已通过校验，否则可能存在隐藏的数据问题
   *
   *   - w?: number | string
   *     含义：写操作确认的副本数（write concern）
   *     场景：配置数据持久性级别，数字表示副本数，'majority' 表示大多数副本集
   *     注意：值越大数据安全性越高，但写入延迟会显著增加（典型值：1/majority）
   *
   *   - wtimeout?: number
   *     含义：写操作超时时间（毫秒）
   *     场景：需要避免写操作长时间阻塞（如高并发场景）
   *     注意：超时后操作可能仍在后台继续，需处理可能的重复提交问题
   *
   * @returns 返回保存后的完整文档（包含生成的_id和默认字段）
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async save(doc: T, options?: SaveOptions) {
    try {
      // 当model存在时，创建新文档实例并保存
      const data = this.model && (await new this.model(doc).save(options))
      return data
    } catch (err) {
      // 将MongoDB原生错误转换为业务友好的错误格式
      // 传入schema用于解析字段验证错误等上下文
      throw mongoDBErrorTransform(err, this.model?.schema)
    }
  }

  /**
   * 批量删除匹配查询条件的文档
   * @param filter 查询条件对象（符合MongoDB查询语法）
   * @param options 删除配置选项（可选），包含以下属性：
   *   - writeConcern?: WriteConcern
   *     含义：删除操作的写入关注级别
   *     场景：需要控制删除操作的确认机制（如集群环境）
   *     注意：默认继承连接级别配置，优先级高于全局配置
   *
   *   - session?: ClientSession
   *     含义：关联的MongoDB会话（用于事务）
   *     场景：需要将删除操作纳入多文档事务时
   *     注意：必须与事务中其他操作使用同一session实例
   *
   *   - hint?: string | Document
   *     含义：强制使用特定索引进行删除
   *     场景：当查询优化器未选择最优索引时强制指定
   *     注意：错误指定可能导致性能下降，需确保索引存在
   *
   *   - let?: Document
   *     含义：定义可在查询中访问的变量
   *     场景：需要复用复杂表达式时（配合$expr使用）
   *     注意：变量仅在当前查询中有效，需MongoDB 5.0+
   *
   *   - comment?: string
   *     含义：在日志中标识操作的注释信息
   *     场景：调试或审计时追踪特定删除操作
   *     注意：会记录在MongoDB日志的command字段中
   *
   *   - collation?: CollationOptions
   *     含义：定义字符串比较规则
   *     场景：需要语言特定的排序规则（如大小写不敏感）
   *     注意：需确保集合支持指定的collation配置
   *
   * @returns 返回包含删除统计的结果对象 { acknowledged, deletedCount }
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async deleteMany(
    filter: RootFilterQuery<T>,
    options?: (MongoDB.DeleteOptions & MongooseBaseQueryOptions<T>) | null
  ) {
    try {
      const data = await this.model.deleteMany(filter, options as MongooseBaseQueryOptions<T>)
      return data
    } catch (err) {
      // 将MongoDB原生错误转换为包含字段验证等上下文的业务错误
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }

  /**
   * 批量更新匹配查询条件的文档
   * @param filter 查询条件对象（符合MongoDB查询语法）
   * @param update 更新操作对象（使用MongoDB更新运算符如$set、$inc等）
   * @param options 更新配置选项（可选），包含以下属性：
   *   - writeConcern?: WriteConcern
   *     含义：定义写操作确认机制
   *     场景：集群环境下需要控制数据持久性级别
   *     注意：默认继承连接配置，单独设置会覆盖全局配置
   *
   *   - upsert?: boolean
   *     含义：当无匹配文档时是否插入新文档
   *     场景：需要实现"存在则更新，不存在则创建"逻辑
   *     注意：插入的文档由filter条件+update内容合并生成，可能需补充默认值
   *
   *   - timestamps?: boolean
   *     含义：是否自动更新Schema定义的更新时间戳（updatedAt）
   *     场景：需要临时覆盖Schema的timestamps配置时
   *     注意：仅影响updatedAt，createdAt不受更新操作影响
   *
   *   - session?: ClientSession
   *     含义：关联的MongoDB会话（用于事务）
   *     场景：需要将更新操作纳入多文档事务时
   *     注意：事务内所有操作必须使用同一session实例
   *
   *   - hint?: string | Document
   *     含义：强制使用特定索引执行更新
   *     场景：查询优化器未选择最优索引时手动指定
   *     注意：错误指定可能导致性能下降，应通过explain验证
   *
   *   - arrayFilters?: Document[]
   *     含义：定义嵌套数组元素的匹配条件
   *     示例：更新数组中特定元素 `{ 'elem.score': { $lt: 60 } }`
   *     注意：条件中的路径变量需以$开头（如`$[elem]`）
   *
   *   - collation?: CollationOptions
   *     含义：定义字符串比较规则
   *     场景：需要语言/大小写敏感的更新条件时
   *     示例：{ locale: 'en', strength: 2 } 表示不区分大小写
   *
   *   - let?: Document
   *     含义：定义可在查询中访问的变量
   *     场景：复用复杂表达式时配合$expr使用
   *     注意：需要MongoDB 5.0+版本支持
   *
   *   - comment?: string
   *     含义：在数据库日志中标识操作的注释
   *     场景：审计追踪或调试特定更新操作
   *     注意：会记录在MongoDB日志的command字段
   *
   * @returns 返回包含更新统计的结果对象 { acknowledged, matchedCount, modifiedCount, upsertedId }
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async updateMany(
    filter: RootFilterQuery<T>,
    update: Record<string, any>,
    options?: (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>) | null
  ) {
    try {
      const data = await this.model.updateMany(
        filter,
        {
          $set: R.omit(this.immutableKeys, update)
        },
        options as MongooseUpdateQueryOptions<T>
      )
      return data
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }

  /**
   * 更新单个匹配查询条件的文档
   * @param filter 查询条件对象（符合MongoDB查询语法）
   * @param update 更新操作对象（使用MongoDB更新运算符如$set、$inc等）
   * @param options 更新配置选项（可选），包含以下属性：
   *   - writeConcern?: WriteConcern
   *     含义：定义写操作确认机制
   *     场景：需要确保单文档更新的持久性（如关键配置变更）
   *     注意：默认使用连接级别的写关注配置
   *
   *   - upsert?: boolean
   *     含义：当无匹配文档时是否插入新文档
   *     场景：实现"存在更新，不存在创建"的原子操作
   *     注意：新文档由filter条件与update内容合并生成，可能需补充必填字段
   *
   *   - timestamps?: boolean
   *     含义：是否自动更新Schema定义的更新时间戳（updatedAt）
   *     场景：需要临时禁用或强制更新时间戳时
   *     注意：仅影响updatedAt字段，不影响createdAt
   *
   *   - session?: ClientSession
   *     含义：关联的MongoDB会话（用于事务）
   *     场景：需要将更新操作纳入ACID事务时
   *     注意：事务中必须使用同一会话实例
   *
   *   - hint?: string | Document
   *     含义：强制使用特定索引进行查询
   *     场景：优化查询性能时指定最优索引
   *     注意：错误指定可能导致全集合扫描
   *
   *   - arrayFilters?: Document[]
   *     含义：定义嵌套数组元素的匹配条件
   *     示例：更新数组中特定元素 `{ 'elem.score': { $lt: 60 } }`
   *     注意：路径变量需以$开头（如`$[elem]`），需要MongoDB 3.6+
   *
   *   - collation?: CollationOptions
   *     含义：定义字符串比较规则
   *     场景：需要语言敏感的更新条件时
   *     示例：{ locale: 'zh', numericOrdering: true } 中文数字排序
   *
   *   - comment?: string
   *     含义：在数据库日志中标识操作的注释
   *     场景：审计追踪敏感操作（如用户权限变更）
   *     注意：会记录在MongoDB的diagnostic log中
   *
   * @returns 返回包含更新统计的结果对象 { acknowledged, matchedCount, modifiedCount, upsertedId }
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async updateOne(
    filter: RootFilterQuery<T>,
    update: Record<string, any>,
    options?: (MongoDB.UpdateOptions & MongooseUpdateQueryOptions<T>) | null
  ) {
    try {
      const data = await this.model.updateOne(
        filter,
        R.omit(this.immutableKeys, update),
        options as MongooseUpdateQueryOptions<T>
      )
      return data
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }

  /**
   * 查找并返回单个匹配查询条件的文档
   * @param filter 查询条件对象（符合MongoDB查询语法）
   * @param options 查找配置选项（可选），包含以下属性：
   *   - projection?: Document | string
   *     含义：指定返回的字段（包含或排除模式）
   *     场景：减少网络传输量或保护敏感字段（如密码）
   *     注意：包含模式 { field: 1 } 与排除模式 { field: 0 } 不可混用（_id 字段除外）
   *
   *   - sort?: string | Document
   *     含义：排序规则，用于确定多个匹配时的返回文档
   *     场景：获取最新记录（如按createTime倒序）或优先级最高文档
   *     注意：排序字段无索引时可能触发内存排序，影响性能
   *
   *   - maxTimeMS?: number
   *     含义：查询最大执行时间（毫秒）
   *     场景：防止慢查询拖累数据库性能
   *     注意：超时后会触发中断，但不会回滚已执行的操作
   *
   *   - collation?: CollationOptions
   *     含义：字符串比较规则配置
   *     场景：需要语言/大小写敏感的查询（如多语言用户名比对）
   *     示例：{ locale: 'en', strength: 2 } 表示不区分大小写
   *
   *   - session?: ClientSession
   *     含义：关联的MongoDB会话（用于事务）
   *     场景：需要保证事务内读取一致性时
   *     注意：事务中读取需配合快照隔离级别使用
   *
   *   - readConcern?: ReadConcern
   *     含义：读取关注级别（如"majority"）
   *     场景：需要读取已提交的多数派数据（金融业务）
   *     注意：需要MongoDB副本集配置支持
   *
   *   - hint?: string | Document
   *     含义：强制使用特定索引
   *     场景：优化器未选择最优索引时手动指定
   *     注意：需通过getIndexes()确认索引名称或形态
   *
   *   - lean?: boolean
   *     含义：是否返回普通JS对象而非Mongoose文档实例
   *     场景：只读操作需提升性能时（节省约40%内存）
   *     注意：返回对象无法调用Schema方法（如save）
   *
   *   - explain?: boolean
   *     含义：返回查询执行计划而非实际结果
   *     场景：分析查询性能瓶颈
   *     注意：生产环境慎用，仅用于调试目的
   *
   *   - comment?: string
   *     含义：在数据库日志中标识操作的注释
   *     场景：审计追踪特定查询操作
   *     注意：会记录在MongoDB的diagnostic log中
   *
   * @returns 返回匹配的文档（格式化后的Mongoose文档实例）或null
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async findOne(
    filter: RootFilterQuery<T>,
    projection: ProjectionType<T> | null | undefined = { __v: 0, _id: 0 },
    options?: QueryOptions<T> | null
  ) {
    try {
      const data = await this.model.findOne(filter, projection, options)
      return data
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }

  /**
   * 查询匹配条件的多个文档
   * @param filter 查询条件对象（符合MongoDB查询语法）
   * @param options 查询配置选项（可选），包含以下属性：
   *   - projection?: Document | string
   *     含义：指定返回字段的包含/排除规则
   *     场景：控制返回数据量或保护敏感字段（如密码哈希）
   *     注意：包含模式 { field: 1 } 与排除模式 { field: 0 } 不可混用（_id 字段除外）
   *
   *   - sort?: string | Document
   *     含义：结果排序规则（1升序，-1降序）
   *     场景：分页排序或业务优先级排序
   *     注意：无索引排序可能导致内存排序，限制100MB工作内存
   *
   *   - skip?: number
   *     含义：跳过指定数量的文档
   *     场景：分页查询时配合limit使用
   *     注意：大数据量分页推荐使用基于游标的方案（如_id范围查询）
   *
   *   - limit?: number
   *     含义：限制返回文档数量
   *     场景：分页控制或限制最大数据集
   *     注意：默认返回所有匹配文档，设为0时返回空数组
   *
   *   - populate?: string | PopulateOptions
   *     含义：关联查询其他集合的文档
   *     场景：实现类似SQL的JOIN操作
   *     注意：深度关联可能显著影响查询性能，建议控制在3层以内
   *
   *   - lean?: boolean
   *     含义：返回普通JS对象而非Mongoose文档实例
   *     场景：只读操作需要优化性能时（节省约50%内存）
   *     注意：返回对象无法调用Schema方法（如save）
   *
   *   - batchSize?: number
   *     含义：指定每次网络请求返回的文档数量
   *     场景：大数据量查询时优化内存使用
   *     注意：需要配合游标使用，默认自动优化
   *
   *   - readConcern?: ReadConcern
   *     含义：读取关注级别（如"majority"）
   *     场景：需要强一致性读取（如金融对账）
   *     注意：需要MongoDB副本集配置支持
   *
   *   - hint?: string | Document
   *     含义：强制使用特定索引
   *     场景：查询优化器未选择最优索引时
   *     注意：错误指定可能导致全集合扫描
   *
   *   - maxTimeMS?: number
   *     含义：查询最大执行时间（毫秒）
   *     场景：防止慢查询影响数据库性能
   *     注意：超时后会终止查询但不会回滚已传输数据
   *
   *   - collation?: CollationOptions
   *     含义：定义字符串比较规则
   *     场景：多语言排序或大小写敏感查询
   *     示例：{ locale: 'zh', numericOrdering: true } 中文数字排序
   *
   *   - comment?: string
   *     含义：数据库日志中的操作注释
   *     场景：审计追踪或性能分析
   *     注意：记录在MongoDB日志的command字段
   *
   *   - explain?: boolean
   *     含义：返回查询执行计划
   *     场景：分析查询性能问题
   *     注意：生产环境慎用，仅调试时开启
   *
   * @returns 返回匹配文档的数组（Mongoose文档实例或普通对象）
   * @throws 转换后的业务可读错误（通过mongoDBErrorTransform处理原生错误）
   */
  public async find(
    filter: RootFilterQuery<T>,
    page?: Page | null,
    sort?: Sort | null,
    projection: ProjectionType<T> | null | undefined = { __v: 0, _id: 0 },
    options?: QueryOptions<T> | null
  ): Promise<{ items: T[]; total: number }> {
    try {
      const items = !!page
        ? await this.model
            .find(filter, projection, options)
            .sort(sort)
            .skip((page?.size ?? 0) * (page?.current ?? 0))
            .limit(page?.size ?? 10)
        : await this.model.find(filter).sort(sort)
      const total = await this.model.countDocuments(filter)
      return {
        items: items,
        total: total
      }
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }

  public async aggregate(
    filter: RootFilterQuery<T>,
    projection: ProjectionType<T> | null | undefined = { __v: 0, _id: 0 },
    page?: Page | null,
    sort?: Sort | null,
    pipeline: PipelineStage[] = [],
    options?: AggregateOptions
  ) {
    try {
      const facet: Record<string, any> = {
        items: [],
        total: [{ $count: 'count' }]
      } // 准备组装分页信息与排序信息

      !R.isNil(projection) && facet.items.push({ $project: projection })
      !R.isNil(sort) && facet.items.push({ $sort: sort })
      !R.isNil(page) && facet.items.push({ $skip: (page.size ?? 0) * (page.current ?? 0) })
      !R.isNil(page) && facet.items.push({ $limit: page.size })
      // 组装全部管道信息
      const usePipeLine = [
        { $match: filter },
        ...pipeline,
        { $facet: facet },
        {
          $project: {
            items: 1,
            total: { $arrayElemAt: ['$total.count', 0] } // 将总数从数组提取为数字
          }
        }
      ]
      // console.log('------------------------------------------')
      // console.log(JSON.stringify(usePipeLine))
      // console.log('------------------------------------------')
      const data = await this.model.aggregate(usePipeLine as any, options)
      return data.map(item=>R.mergeAll([{total:0},item]))
    } catch (err) {
      throw mongoDBErrorTransform(err, this.model.schema)
    }
  }
}
