'use strict';
// src/model/user/User.ts
import { mergeAll } from 'ramda';
import { Document, Schema, SchemaDefinition } from 'mongoose';
import type { IUser } from "../base/schema";
import userBaseSchema from "../base/schema";
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
export default{
  avatar: {
    type: String,
  },
  phone: {
    type: String,
    sparse: true, // 稀疏
    unique: [true,'该电话已被占用'], // 唯一
  },
  email: {
    type: String,
    sparse: true, // 稀疏
    unique: [true,'该电话已被占用'], // 唯一
  },
  age:{
    type: Number,
    min:0,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // 默认创建时间为当前时间
  },
} as SchemaDefinition<ExpandUser>