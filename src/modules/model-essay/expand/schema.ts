'use strict';
// src/model/user/User.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseModelEssaySchema from "../core/schema";
import type { IModelEssay } from "../core/schema";
// 定义用户接口
// 定义用户接口
export interface ExpandModelEssay extends IModelEssay {
}

export type ExpandModelEssayDocument = Document<ExpandModelEssay>

// 定义用户模型的结构
const modelEssayExpandSchema: SchemaDefinition<ExpandModelEssay> = R.mergeAll([
  baseModelEssaySchema,
  {} as SchemaDefinition<ExpandModelEssay>
]);

export default modelEssayExpandSchema