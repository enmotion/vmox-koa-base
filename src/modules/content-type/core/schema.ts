/*
 * 内容分类标签模块 - 数据模型定义
 * @Author: enmotion
 * @Date: 2025-05-22 12:23:41
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 12:34:37
 * 
 * @desc 定义内容分类标签核心数据结构和数据库Schema
 * @warning 所有时间字段由系统自动维护，禁止手动修改
 */
'use strict';

import { Document, SchemaDefinition } from 'mongoose';
import uniqid from "uniqid";

/**
 * 分类实体接口
 * @interface ICategory
 * @property {string} key - 分类唯一标识
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 * @property {boolean} status - 分类状态
 * @property {number} order - 排序值
 * @property {string} [createdUser] - 创建者ID
 * @property {Date} createdAt - 创建时间
 * @property {string} [updatedUser] - 更新者ID
 * @property {Date} updatedAt - 更新时间
 */
export interface ICategory {
  _id:string,
  key: string;
  name: string;
  description?: string;
  super:0|1
  status: boolean;
  order: number;
  createdUser?: string;
  createdAt: Date;
  updatedUser?: string;
  updatedAt: Date;
}

/**
 * 标签实体接口
 * @interface ITag
 * @property {string} key - 标签唯一标识
 * @property {string} name - 标签名称
 * @property {string} [description] - 标签描述
 * @property {boolean} status - 标签状态
 * @property {number} order - 排序值
 * @property {string} [createdUser] - 创建者ID
 * @property {Date} createdAt - 创建时间
 * @property {string} [updatedUser] - 更新者ID
 * @property {Date} updatedAt - 更新时间
 */
export interface ITag {
  _id:string
  key: string;
  name: string;
  description?: string;
  super:0|1
  status: boolean;
  order: number;
  createdUser?: string;
  createdAt: Date;
  updatedUser?: string;
  updatedAt: Date;
}

/**
 * 标签关联实体接口
 * @interface ITagAssociation
 * @property {string} categoryId - 分类ID
 * @property {string} tagId - 标签ID
 * @property {string} [parentAssociationId] - 父级关联ID
 * @property {boolean} [allowAIrecognition] - 允许AI识别，关闭后，AI将无法获得该标签
 * @property {number} order - 排序值
 * @property {string} [createdUser] - 创建者ID
 * @property {Date} createdAt - 创建时间
 * @property {string} [updatedUser] - 更新者ID
 * @property {Date} updatedAt - 更新时间
 */
export interface ITagAssociation {
  _id:string,
  categoryId: string;
  tagId: string;
  parentAssociationId?: string;
  allowAiRecognition?: boolean;
  order: number;
  createdUser?: string;
  createdAt: Date;
  updatedUser?: string;
  updatedAt: Date;
}

/**
 * 分类Schema配置
 */
export const categorySchemaConfig: SchemaDefinition<ICategory> = {
  key: {
    type: String,
    name: '分类标识',
    required: [true, '分类标识不能为空'],
    unique: [true, '该分类标识已被占用'],
    trim: true
  },
  name: {
    type: String,
    name: '分类名称',
    required: [true, '分类名称不能为空'],
    trim: true
  },
  super:{
    type:Number,
    enum:[0,1],
    required:true,
    default:0
  },
  description: {
    type: String,
    name: '分类描述',
    trim: true
  },
  status: {
    type: Boolean,
    name: '分类状态',
    default: true
  },
  order: {
    type: Number,
    name: '排序值',
    
    required: [true, '排序值不能为空'],
    min: [0, '排序值不能小于0'],
    default: 0
  },
  createdUser: {
    type: String,
    name: '创建者',
    sparse: true,
    immutable: true
  },
  createdAt: {
    type: Date,
    name: '创建时间',
    required: true,
    default: Date.now,
    immutable: true
  },
  updatedUser: {
    type: String,
    name: '更新者',
    sparse: true
  },
  updatedAt: {
    type: Date,
    name: '更新时间',
    sparse: true
  }
};

/**
 * 标签Schema配置
 */
export const tagSchemaConfig: SchemaDefinition<ITag> = {
  key: {
    type: String,
    name: '标签标识',
    required: [true, '标签标识不能为空'],
    unique: [true, '该标签标识已被占用'],
    trim: true
  },
  name: {
    type: String,
    name: '标签名称',
    required: [true, '标签名称不能为空'],
    trim: true
  },
  super:{
    type:Number,
    enum:[0,1],
    required:true,
    default:0
  },
  description: {
    type: String,
    name: '标签描述',
    trim: true
  },
  status: {
    type: Boolean,
    name: '标签状态',
    default: true
  },
  order: {
    type: Number,
    name: '排序值',
    required: [true, '排序值不能为空'],
    min: [0, '排序值不能小于0'],
    default: 0
  },
  createdUser: {
    type: String,
    name: '创建者',
    sparse: true,
    immutable: true
  },
  createdAt: {
    type: Date,
    name: '创建时间',
    required: true,
    default: Date.now,
    immutable: true
  },
  updatedUser: {
    type: String,
    name: '更新者',
    sparse: true
  },
  updatedAt: {
    type: Date,
    name: '更新时间',
    sparse: true
  }
};

/**
 * 标签关联Schema配置
 */
export const tagAssociationSchemaConfig: SchemaDefinition<ITagAssociation> = {
  categoryId: {
    type: String,
    name: '分类ID',
    required: [true, '分类ID不能为空'],
    ref: 'Category',
    immutable: true
  },
  tagId: {
    type: String,
    name: '标签ID',
    required: [true, '标签ID不能为空'],
    ref: 'Tag',
    immutable: true
  },
  parentAssociationId: {
    type: String,
    name: '父级关联ID',
    sparse: true,
    ref: 'TagAssociation',
    default:''
  },
  allowAiRecognition:{
    type: Boolean,
    name: "允许AI识别",
    sparse: true,
    default: true
  },
  order: {
    type: Number,
    name: '排序值',
    required: [true, '排序值不能为空'],
    min: [0, '排序值不能小于0'],
    default: 0,
  },
  createdUser: {
    type: String,
    name: '创建者',
    sparse: true,
    immutable: true
  },
  createdAt: {
    type: Date,
    name: '创建时间',
    required: true,
    default: Date.now,
    immutable: true
  }
}; 