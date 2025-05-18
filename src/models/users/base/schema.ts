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
 * @interface IUser
 * @property {string} uid - 系统生成的唯一ID
 * @property {'register'|'admin'} createType - 账户创建方式：用户注册/管理员创建
 * @property {string} username - 唯一登录标识，需做前后空格过滤处理
 * @property {string} password - 使用bcrypt加密后的密码哈希值
 * @property {string} [createdUser] - 创建者ID(管理员操作时记录)，系统创建可为空
 * @property {Date} createdAt - 记录创建时间(自动生成，不可修改)
 * @property {string} [updatedUser] - 最后修改人ID(用于操作审计)
 * @property {Date} updatedAt - 最后修改时间(自动更新)
 */

export interface IUser{
  uid:string; // 用户ID
  createType:"register"|"admin" // 创建方式 注册|管理员创建
  username: string;     // 用户名
  password: string;     // 用户密码
  createUser:string;   // 创建用户 系统创建时为空
  createAt: Date;      // 创建时间
  updateUser:string;   // 修改用户
  updateAt: Date;      // 修改时间
}
/**
 * 用户文档类型
 * @typedef {Document<IUser>} IUserDocument
 * @desc 扩展Mongoose Document类型，包含用户接口定义的所有字段
 */
export type IUserDocument = Document<IUser>

/**
 * Mongoose Schema配置
 * @constant
 * @type {SchemaDefinition<IUser>}
 * @property {Object} uid - 用户唯一标识配置
 *   @property {String} type - 字段类型
 *   @property {Boolean} index - 建立索引加速查询
 *   @property {String} name - 字段显示名称
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Function} default - 默认值生成函数
 * @property {Object} createType - 账户创建类型配置
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

export default {
  uid: {
    type: String,
    index:true,
    name:'用户ID',
    unique: [true, '该用户ID已被占用'],
    default:()=>uniqid()
  },
  createType:{
    type:String,
    enum:["register","admin"],
    required:true,
    default:"register"
  },
  username: {
    type: String,
    name:'用户名称',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少用户名，创建失败'],
    unique:  [true, '该用户名已被占用'], // 用户名唯一
  },
  password: {
    type: String,
    name:'用户密码',
    required: [true, '缺少密码创建失败'],
    minlength: [8, '密码长度不能少于8位']
  },
  createUser:{
    type:String,
    name:'创建用户',
    sparse:true,
  },
  createAt: {
    type: Date,
    name:'创建时间',
    required:true,
    default: Date.now, // 默认创建时间为当前时间
    immutable: true,
  },
  updateUser:{
    type:String,
    name:'更新用户',
    sparse:true,
  },
  updateAt: {
    type: Date,
    name:'更新时间',
    default: Date.now, // 默认更新时间为创建时间
  },
} as SchemaDefinition<IUser>;