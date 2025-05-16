/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:26:00
 */

"use strict"
// src/model/user/User.ts
import { Document, SchemaDefinition, } from 'mongoose';
import uniqid from "uniqid"
// 定义用户接口
export interface IUser extends Document {
  uid:string;
  username: string;
  password: string;
  createdAt: Date;
}

// 定义用户模型的结构
export default {
  uid: {
    type: String,
    index:true,
    name:'用户ID',
    unique: [true, '该用户ID已被占用'],
    default:()=>uniqid().toUpperCase()
  },
  username: {
    type: String,
    name:'用户名称',
    required: [true, '缺少用户名，创建失败'],
    unique:  [true, '该用户名已被占用'], // 用户名唯一
  },
  password: {
    type: String,
    name:'用户密码',
    required: [true, '缺少密码创建失败'],
  }, 
  createdAt: {
    type: Date,
    name:'创建时间',
    default: Date.now, // 默认创建时间为当前时间
  },
} as SchemaDefinition<IUser>;