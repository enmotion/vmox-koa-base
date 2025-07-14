/*
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 * 
 * 问题集数据模型定义文件
 * @desc 定义问题集核心数据结构和数据库Schema
 * @warning 所有时间字段由系统自动维护，禁止手动修改
 */

"use strict"
import { Document, SchemaDefinition } from 'mongoose';
import uniqid from "uniqid"

/**
 * 问题集实体接口
 * @interface IApp
 * @property {string} _id - 系统生成的唯一ID
 * @property {string} title - 问题标题，必填且唯一
 * @property {string} definition - 问题定义，详细描述问题的特征和表现
 * @property {string} example - 问题范例，提供具体的错误示例
 * @property {string} coreFix - 修改核心，明确指出修改的关键点
 * @property {number} difficultyLevel - 难度等级（1-5），1为最简单，5为最复杂
 * @property {number} gradeLevel - 学龄等级（1-6），对应小学一年级到六年级
 * @property {number} super - 操作权限等级，默认为0，数值越大权限越高
 * @property {ITrainingData[]} trainingData - 训练数据数组，用于AI模型训练
 * @property {boolean} status - 状态标识，控制问题的启用/禁用状态
 * @property {string} createdUser - 创建用户ID
 * @property {Date} createdAt - 记录创建时间(自动生成，不可修改)
 * @property {string} updatedUser - 最后修改人ID(用于操作审计)
 * @property {Date} updatedAt - 最后修改时间(自动更新)
 */
export interface IApp {
  _id: string;                        // 问题ID
  appName: string;                    // 应用名称
  apiKey:string;                      // 访问密钥
  description:string;                 // 应用描述
  power: string[];                    // 允许权限
  super: number;                      // 操作权限等级
  status: boolean;                    // 状态标识
  createdUser: string;                // 创建用户
  createdAt: Date;                    // 创建时间
  updatedUser: string;                // 修改用户
  updatedAt: Date;                    // 修改时间
}

/**
 * 问题集文档类型
 * @typedef {Document<IApp>} IAppDocument
 * @desc 扩展Mongoose Document类型，包含问题集接口定义的所有字段
 */
export type IAppDocument = Document<IApp>

/**
 * Mongoose Schema配置
 * @constant
 * @type {SchemaDefinition<IApp>}
 * @property {Object} _id - 问题唯一标识配置
 *   @property {String} type - 字段类型
 *   @property {Boolean} index - 建立索引加速查询
 *   @property {String} name - 字段显示名称
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Function} default - 默认值生成函数
 * @property {Object} appName - 问题标题配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} power - 问题定义配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} minlength - 最小长度限制
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} super - 权限等级配置
 *   @property {Number} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Number} default - 默认值
 *   @property {Number} min - 最小值限制
 *   @property {Number} max - 最大值限制
 * @property {Object} status - 状态配置
 *   @property {Boolean} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Boolean} default - 默认值true
 * @property {Object} createdAt - 创建时间配置
 *   @property {Date} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Function} default - 默认值(Date.now)
 *   @property {Boolean} immutable - 禁止修改
 */
export const problemBaseSchema: SchemaDefinition<IApp> = {
  appName: {
    type: String,
    name: '应用名称',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少应用名称，创建失败'],
    unique: [true, '该应用名称已被占用'], // 问题标题唯一
    maxlength: [200, '应用名称长度不能超过200字符']
  },
  apiKey: {
    type: String,
    name: '应用KEY',
    unique: [true,'apiKey已被占用'],
    required: [true, '缺少应用KEY，创建失败'],
    minlength: [10, '应用KEY长度不能少于10字符'],
    maxlength: [64, '应用KEY长度不能超过2000字符']
  },
  description: {
    type: String,
    name: '应用描述',
    trim: true,  // 自动去除前后空格
    default:''
  },
  power :{
    type: [String],
    name: '应用权限',
    default:[]
  },
  super: {
    type: Number,
    name: '操作权限等级',
    default: 0,
    min: [0, '权限等级不能小于0'],
  }, 
  status: {
    type: Boolean,
    name: '状态标识',
    default: true
  },
  createdUser: {
    type: String,
    name: '创建用户',
    required: [true, '缺少创建用户信息']
  },
  createdAt: {
    type: Date,
    name: '创建时间',
    required: true,
    default: Date.now, // 默认创建时间为当前时间
    immutable: true,
  },
  updatedUser: {
    type: String,
    name: '更新用户',
    sparse: true,
  },
  updatedAt: {
    type: Date,
    name: '更新时间',
    sparse: true,
  },
}

export default problemBaseSchema 