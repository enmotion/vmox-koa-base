// src/model/user/User.ts
import mongoose, { Document, Schema } from 'mongoose';

// 定义用户接口
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  createdAt: Date;
}

// 定义用户模型的结构
export const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, // 用户名唯一
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // 邮箱唯一
  },
  createdAt: {
    type: Date,
    default: Date.now, // 默认创建时间为当前时间
  },
});