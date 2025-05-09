// src/model/user/User.ts
import { Document, Schema } from 'mongoose';
import uniqid from "uniqid";


// 定义用户接口
export interface IUser extends Document {
  uid:string,
  username: string; // 用户账号
  password: string; // 用户密码
  avatar: string; // 用户头像
  phone: string; // 用户电话
  email: string; // 用户邮箱
  createdAt: Date; // 创建时间
  updatedAt: Date; // 修改时间
}

// 定义用户模型的结构
export default new Schema<IUser>({
  uid: {
    type: String,
    index:true,
    unique:true,
    default:()=>uniqid().toUpperCase()
  },
  username: {
    type: String,
    required: true,
    unique: true, // 用户名唯一
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // 邮箱唯一
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