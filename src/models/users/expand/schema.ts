'use strict';
// src/model/user/User.ts
import { Document, Schema } from 'mongoose';
import type { IUser } from "../base/schema"
import uniqid from "uniqid"
// 定义用户接口
// 定义用户接口
export interface ExpandUser extends IUser {
  avatar: string; // 用户头像
  phone: string; // 用户电话
  email: string; // 用户邮箱
  age:number,
  updatedAt: Date; // 修改时间
}

// 定义用户模型的结构
export default new Schema<ExpandUser>({
  uid: {
    type: String,
    index:true,
    unique: [true, '该用户ID已被占用'],
    default:()=>uniqid().toUpperCase()
  },
  username: {
    type: String,
    required: [true, '缺少用户名，创建失败'],
    unique:  [true, '该用户名已被占用'], // 用户名唯一
  },
  password: {
    type: String,
    required: [true, '缺少密码创建失败'],
  }, 
  avatar: {
    type: String,
  },
  phone: {
    type: String,
    sparse: true, // 稀疏
    unique: true, // 唯一
  },
  email: {
    type: String,
    sparse: true, // 稀疏
    unique: true, // 唯一
  },
  age:{
    type: Number,
    min:0,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // 默认创建时间为当前时间
  },
  createdAt: {
    type: Date,
    default: Date.now, // 默认创建时间为当前时间
  },
});