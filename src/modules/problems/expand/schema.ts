'use strict';
// src/model/user/User.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseUserSchema from "../core/schema";
import type { IProblem } from "../core/schema";
// 定义用户接口
// 定义用户接口
export interface ExpandProblem extends IProblem {
}

export type ExpandUserDocument = Document<ExpandProblem>

// 定义用户模型的结构
const userExpandSchema: SchemaDefinition<ExpandProblem> = R.mergeAll([
  baseUserSchema,
  {} as SchemaDefinition<ExpandProblem>
]);

export default userExpandSchema