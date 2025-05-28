'use strict';
// src/model/user/User.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseUserSchema from "../core/schema";
import type { IUser } from "../core/schema";
// 定义用户接口
// 定义用户接口
export interface ExpandUser extends IUser {
  nickname: string,   // 用户昵称
  avatar: string;     // 用户头像
  phone: object;      // 用户电话
  email: string;      // 用户邮箱
  birth: Date,        // 用户生日
  age?: number;       // 计算属性：年龄
}

export type ExpandUserDocument = Document<ExpandUser>

// 定义用户模型的结构
const userExpandSchema: SchemaDefinition<ExpandUser> = R.mergeAll([
  baseUserSchema,
  {
    nickname:{
      type:String,
      sparse:true,
      unique:[true, '该昵称已经被占用'],
      name:'用户昵称'
    },
    avatar: {
      type: String,
      sparse:true,
      name:'用户头像'
    },
    phone: {
      type: Object,
      name:'用户手机',
      sparse: true, // 稀疏
      unique: [true,'该手机号码已被占用'], // 唯一
      validate:{
        validator:(value)=> {
          return (typeof value == 'number' && !isNaN(value)) || typeof value == 'string'
        },
        message:"电话必须为字符或者数值"
      },
    },
    email: {
      type: String,
      name:'用户邮箱',
      sparse: true, // 稀疏
      unique: [true,'该邮箱地址已被占用'], // 唯一
    },
    birth:{
      type: Date,
      name:'用户生日',
      sparse: true, // 稀疏
    },
  } as SchemaDefinition<ExpandUser>
]);

export default userExpandSchema