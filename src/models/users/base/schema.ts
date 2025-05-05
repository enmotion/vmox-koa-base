'use strict';
// src/model/user/User.ts
import { Document, Schema } from 'mongoose';
import uniqid from "uniqid"
// 定义用户接口
export interface IUser extends Document {
  uid:string;
  username: string;
  password: string;
  createdAt: Date;
}

// 定义用户模型的结构
export default new Schema<IUser>({
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
  createdAt: {
    type: Date,
    default: Date.now, // 默认创建时间为当前时间
  },
});