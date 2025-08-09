/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:26:00
 * 
 * 用户数据模型定义文件
 * @desc 定义用户核心数据结构和数据库Schema
 * @warning 密码字段必须经过加密处理后再存储
 * @note 所有时间字段由系统自动维护，禁止手动修改
 */

"use strict"
import { Document, SchemaDefinition, } from 'mongoose';
import uniqid from "uniqid"

/**
* 用户实体接口
 * @interface IClient
 * @property {string} uid - 系统生成的唯一ID
 * @property {'register'|'admin'} createdType - 账户创建方式：用户注册/管理员创建
 * @property {string} username - 唯一登录标识，需做前后空格过滤处理
 * @property {string} password - 使用bcrypt加密后的密码哈希值
 * @property {string} [createdUser] - 创建者ID(管理员操作时记录)，系统创建可为空
 * @property {Date} createdAt - 记录创建时间(自动生成，不可修改)
 * @property {string} [updatedUser] - 最后修改人ID(用于操作审计)
 * @property {Date} updatedAt - 最后修改时间(自动更新)
 */

export interface IClient{
  uid:string;                        // 用户ID
  super:number,                     // 是否为超级，超级不可修改删除，它只能通过数据操作，作为用户，他也代表最高权限使用者 它是每个几何中，都需要携带的扩展字段
  username: string;                  // 用户名
  password: string;                  // 用户密码
  loginCount:number;                 // 用户登录次数
  powVersion:number;                 // 用户权限版本
  status:boolean;                    // 用户状态
  createdType:"register"|"admin";    // 创建方式 注册|管理员创建
  createdUser:string;                // 创建用户 系统创建时为空
  createdAt: Date;                   // 创建时间
  updatedUser:string;                // 修改用户
  updatedAt: Date;                   // 修改时间
}
/**
 * 用户文档类型
 * @typedef {Document<IClient>} IClientDocument
 * @desc 扩展Mongoose Document类型，包含用户接口定义的所有字段
 */
export type IClientDocument = Document<IClient>

/**
 * Mongoose Schema配置
 * @constant
 * @type {SchemaDefinition<IClient>}
 * @property {Object} uid - 用户唯一标识配置
 *   @property {String} type - 字段类型
 *   @property {Boolean} index - 建立索引加速查询
 *   @property {String} name - 字段显示名称
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Function} default - 默认值生成函数
 * @property {Object} createdType - 账户创建类型配置
 *   @property {String} type - 字段类型
 *   @property {Array} enum - 限定值范围['register','admin']
 *   @property {Boolean} required - 必填字段约束
 *   @property {String} default - 默认值'register'
 * @property {Object} username - 用户名配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Array} unique - 唯一性约束及错误提示
 * @property {Object} password - 密码配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Boolean} [select=false] - 查询时默认不返回
 * @property {Object} createdAt - 创建时间配置
 *   @property {Date} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Function} default - 默认值(Date.now)
 *   @property {Boolean} [immutable=true] - 禁止修改
 */
export const userBaseSchema:SchemaDefinition<IClient> = {
  uid: {
    type: String,
    index:true,
    name:'用户ID',
    unique: [true, '该用户ID已被占用'],
    default:()=>uniqid()
  },
  username: {
    type: String,
    name:'用户账号',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少用户账号，创建失败'],
    unique:  [true, '该用户账号已被占用'], // 用户名唯一
  },
  status: {
    type: Boolean,
    name:'用户状态',
    default:true
  },
  password: {
    type: String,
    name:'用户密码',
    required: [true, '缺少密码创建失败'],
    minlength: [8, '密码长度不能少于8位']
  },
  loginCount:{
    type: Number,
    name:'登录次数',
    required:true,
    min: [0, '用户登录次数不可以为负数'],
    default:0,
  },
  powVersion:{
    type: Number,
    name:'权限版本',
    required:true,
    min: [0, '权限版本不可以为负数'],
    default:0,
  },
  super:{
    type:Number,
    name:"是否为超级数据",
    default:0
  },
  createdType:{
    type:String,
    enum:["register","admin"],
    required:true,
    immutable: true,
    default:"register"
  },
  createdUser:{
    type:String,
    name:'创建用户',
    sparse:true,
    immutable: true,
  },
  createdAt: {
    type: Date,
    name:'创建时间',
    required:true,
    default: Date.now, // 默认创建时间为当前时间
    immutable: true,
  },
  updatedUser:{
    type:String,
    name:'更新用户',
    sparse:true,
  },
  updatedAt: {
    type: Date,
    name:'更新时间',
    sparse:true,
  },
}
export default userBaseSchema