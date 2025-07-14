/*
 * @Author: enmotion 
 * @Date: 2025-07-02 17:22:00 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-07-02 17:22:00
 * 
 * 范文数据结构定义
 * @desc 定义范文核心数据结构和数据库Schema
 * @warning 所有时间字段由系统自动维护，禁止手动修改
 */

"use strict"
import { Document, SchemaDefinition } from 'mongoose';
import { v4 } from "uuid"
import uniqid from "uniqid"

/**
 * 范文实体接口
 * @interface IModelEssayDocument
 * @property {string} _id - 系统生成的唯一ID
 * @property {string} uuid - 系统递增值
 * @property {string} title - 范文标题，必填且唯一
 * @property {string} content - 范文征文内容，必填 
 * @property {number[]} [vector] - 向量化表示，用于AI模型处理
 * @property {string} genre - 范文范例，提供具体的错误示例
 * @property {string} writingMethods - 修改核心，明确指出修改的关键点
 * @property {number} sync - 同步作文标签
 * @property {number} super - 操作权限等级，默认为0，数值越大权限越高
 * @property {boolean} status - 状态标识，控制范文的启用/禁用状态
 * @property {string} createdUser - 创建用户ID
 * @property {Date} createdAt - 记录创建时间(自动生成，不可修改)
 * @property {string} updatedUser - 最后修改人ID(用于操作审计)
 * @property {Date} updatedAt - 最后修改时间(自动更新)
 */
export interface IModelEssay {
  // _id: string;                        // 范文ID
  uuid:string;                        // 范文UUID 给到 qdrant 使用  
  title: string;                      // 范文标题
  content:string;                     // 范文内容
  vector?: number[];                  // 向量化表示

  genre:string[];                       // 范文体裁
  writingMethods:string[];            // 写作方法
  sync:string[];                        // 同步作文标签

  appreciationGuide:string;           // 欣赏指导
  from:string                         // 文章来源 投稿，采集，AI 
  super:number;                       // 操作权限等级
  status: boolean;                    // 范围文状态 上下架状态
  processingStatus:number,            // 范文加工状态 0:原文 1:提交评审 2:AI评审中 3:待复核 4:已复核
  createdUser:string;                 // 创建用户 
  createdAt: Date;                    // 创建时间
  updatedUser?: string;               // 修改用户
  updatedAt?: Date;                   // 修改时间
}

/**
 * 范文文档类型
 * @typedef {Document<IModelEssay>} IModelEssayDocument
 * @desc 扩展Mongoose Document类型，包含范文接口定义的所有字段
 */
export type IModelEssayDocument = Document<IModelEssay>

/**
 * Mongoose Schema配置
 * @constant
 * @type {SchemaDefinition<IModelEssayDocument>}
 * @property {Object} _id - 范文唯一标识配置
 *   @property {String} type - 字段类型
 *   @property {Boolean} index - 建立索引加速查询
 *   @property {String} name - 字段显示名称
 *   @property {Array} unique - 唯一性约束及错误提示
 *   @property {Function} default - 默认值生成函数
 * @property {Object} title - 范文标题配置
 *   @property {String} type - 字段类型
 *   @property {String} name - 字段显示名称
 *   @property {Array} required - 必填约束及错误提示
 *   @property {Array} unique - 唯一性约束及错误提示
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
export const modelEssayBaseSchema: SchemaDefinition<IModelEssay> = {
  uuid:{
    type: String,
    index: true,
    name: '范文UUID',
    immutable:true,
    unique: [true, '该范文UUID已被占用'],
    default: v4
  },
  title: {
    type: String,
    name: '范文标题',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少范文标题，创建失败'],
    maxlength: [200, '范文标题长度不能超过200字符']
  },
  content: {
    type: String,
    name: '范文内容',
    trim: true,  // 自动去除前后空格
    required: [true, '缺少范文内容，创建失败'],
    maxlength: [2000, '范文标题长度不能超过5000字符']
  },
  vector:{
    type: Array,
    name: '向量化表示',
    required:[true, '缺少向量化表示，创建失败'],
  },
  genre:{
    type: [String],
    name: '范文体裁',
    default:[]
  },
  writingMethods:{
    type: [String],
    name: '写作方法',
    default:[]
  },
  sync:{
    type: [String],
    name: '同步作文标签',
    default:[]
  },
  appreciationGuide: {
    type: String,
    name: '欣赏指导',
    maxlength: [5000, '欣赏指导长度不能超过5000字符'],
    default: ''
  },
  from: {
    type: String,
    name: '文章来源',
    required: [true, '缺少文章来源，创建失败'],
    enum: ['UGC', 'PGC', 'AGC'],
    default: 'PGC',
    trim: true
  },
  super: {
    type: Number,
    name: '操作权限等级',
    default: 0,
    min: [0, '权限等级不能小于0'],
  },
  status: {
    type: Boolean,
    name: '范文状态',
    default: true
  },
  processingStatus: {
    type: Number,
    name: '范文审核状态',
    default: 0
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

export default modelEssayBaseSchema 