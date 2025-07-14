'use strict';
// src/model/user/User.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseUserSchema from "../core/schema";
import type { IAppreciate } from "../core/schema";
// 定义用户接口
// 定义用户接口
export interface ExpandAppreciate extends IAppreciate {
}

export type ExpandUserDocument = Document<ExpandAppreciate>

// 定义用户模型的结构
const userExpandSchema: SchemaDefinition<ExpandAppreciate> = R.mergeAll([
  baseUserSchema,
  {} as SchemaDefinition<ExpandAppreciate>
]);

export default userExpandSchema