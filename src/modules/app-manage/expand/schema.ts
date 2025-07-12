'use strict';
// src/model/user/User.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseUserSchema from "../core/schema";
import type { IApp } from "../core/schema";
// 定义用户接口
// 定义用户接口
export interface ExpandApp extends IApp {
}

export type ExpandUserDocument = Document<VBArrayConstructor>

// 定义用户模型的结构
const userExpandSchema: SchemaDefinition<ExpandApp> = R.mergeAll([
  baseUserSchema,
  {} as SchemaDefinition<ExpandApp>
]);

export default userExpandSchema