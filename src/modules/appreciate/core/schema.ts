/*
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 * 
 * 亮点集数据模型定义文件
 * @desc 定义亮点集核心数据结构和数据库Schema
 * @warning 所有时间字段由系统自动维护，禁止手动修改
 */

"use strict"
import { Document, SchemaDefinition } from 'mongoose';
import uniqid from "uniqid"

/**
 * 训练数据结构接口
 * @interface ITrainingData
 * @property {string} q - 亮点
 * @property {string} a - 答案
 */
export interface ITrainingData {
  q: string;  // 亮点
  a: string;  // 答案
}

/**
 * 亮点集实体接口
 * @interface IAppreciate
 * @property {string} _id - 系统生成的唯一ID
 * @property {string} title - 亮点标题，必填且唯一
 * @property {string} definition - 亮点定义，详细描述亮点的特征和表现
 * @property {string} example - 亮点范例，提供具体的错误示例
 * @property {string} coreFix - 修改核心，明确指出修改的关键点
 * @property {number} difficultyLevel - 难度等级（1-5），1为最简单，5为最复杂
 * @property {number} gradeLevel - 学龄等级（1-6），对应小学一年级到六年级
 * @property {number} super - 操作权限等级，默认为0，数值越大权限越高
 * @property {ITrainingData[]} trainingData - 训练数据数组，用于AI模型训练
 * @property {boolean} status - 状态标识，控制亮点的启用/禁用状态
 * @property {string} createdUser - 创建用户ID
 * @property {Date} createdAt - 记录创建时间(自动生成，不可修改)
 * @property {string} updatedUser - 最后修改人ID(用于操作审计)
 * @property {Date} updatedAt - 最后修改时间(自动更新)
 */
export interface IAppreciate {
  _id: string;                        // 亮点ID
  title: string;                      // 亮点标题
  definition: string;                 // 亮点定义
  example: string;                    // 亮点范例
  effect:string,                      // 亮点作用
  difficultyLevel: number;            // 难度等级（1-5）
  gradeLevel: number;                 // 学龄等级（1-6）
  super: number;                      // 操作权限等级
  trainingData: ITrainingData[];      // 训练数据数组
  status: boolean;                    // 状态标识
  createdUser: string;                // 创建用户
  createdAt: Date;                    // 创建时间
  updatedUser: string;                // 修改用户
  updatedAt: Date;                    // 修改时间
}

/**
 * 亮点集文档类型
 * @typedef {Document<IAppreciate>} IAppreciateDocument
 * @desc 扩展Mongoose Document类型，包含亮点集接口定义的所有字段
 */
export type IAppreciateDocument = Document<IAppreciate>

/**
 * Mongoose Schema配置
 * @constant
 * @type {SchemaDefinition<IAppreciate>}
 * @property {Object} _id - 亮点唯一标识配置
 *   @property {String} type - 字段类型
 *   @property {Boolean} index - 建立索引加速查询
 *   @property {String} name - 字段显示名称
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Function} default - 默认值生成函数
 * @property {Object} title - 亮点标题配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} definition - 亮点定义配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} minlength - 最小长度限制
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} example - 亮点范例配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} minlength - 最小长度限制
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} coreFix - 修改核心配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} minlength - 最小长度限制
 *   @property {Number} maxlength - 最大长度限制
 * @property {Object} difficultyLevel - 难度等级配置
 *   @property {Number} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} min - 最小值限制
 *   @property {Number} max - 最大值限制
 * @property {Object} gradeLevel - 学龄等级配置
 *   @property {Number} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Number} min - 最小值限制
 *   @property {Number} max - 最大值限制
 * @property {Object} super - 权限等级配置
 *   @property {Number} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Number} default - 默认值
 *   @property {Number} min - 最小值限制
 *   @property {Number} max - 最大值限制
 * @property {Object} trainingData - 训练数据配置
 *   @property {Array} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} default - 默认空数组
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
export const AppreciateBaseSchema: SchemaDefinition<IAppreciate> = {
  _id: {
    type: String,
    index: true,
    name: '亮点ID',
    unique: [true, '该亮点ID已被占用'],
    default: () => uniqid()
  },
  title: {
    type: String,
    name: '亮点标题',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少亮点标题，创建失败'],
    unique: [true, '该亮点标题已被占用'], // 亮点标题唯一
    maxlength: [200, '亮点标题长度不能超过200字符']
  },
  definition: {
    type: String,
    name: '亮点定义',
    required: [true, '缺少亮点定义，创建失败'],
    minlength: [1, '亮点定义长度不能少于1字符'],
    maxlength: [2000, '亮点定义长度不能超过2000字符']
  },
  example: {
    type: String,
    name: '亮点范例',
    required: [true, '缺少亮点范例，创建失败'],
    minlength: [1, '亮点范例长度不能少于1字符'],
    maxlength: [5000, '亮点范例长度不能超过5000字符']
  },
  effect: {
    type: String,
    name: '亮点作用',
    required: [true, '缺少亮点作用，创建失败'],
    minlength: [1, '亮点作用长度不能少于1字符'],
    maxlength: [5000, '亮点作用长度不能超过5000字符']
  },
  difficultyLevel: {
    type: Number,
    name: '难度等级',
    required: [true, '缺少难度等级，创建失败'],
    min: [1, '难度等级不能小于1'],
    max: [5, '难度等级不能大于5'],
    default: 1
  },
  gradeLevel: {
    type: Number,
    name: '学龄等级',
    required: [true, '缺少学龄等级，创建失败'],
    min: [1, '学龄等级不能小于1'],
    max: [3, '学龄等级不能大于6'],
    default: 1
  },
  super: {
    type: Number,
    name: '操作权限等级',
    default: 0,
    min: [0, '权限等级不能小于0'],
  },
  trainingData: {
    type: [{
      q: {
        type: String,
        required: [true, '训练数据亮点不能为空']
      },
      a: {
        type: String,
        required: [true, '训练数据答案不能为空']
      }
    }],
    name: '训练数据',
    default: []
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

export default AppreciateBaseSchema 