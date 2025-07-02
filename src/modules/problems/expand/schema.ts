'use strict';
// src/modules/problems/expand/schema.ts
import * as R from "ramda";
import { Document, Schema, SchemaDefinition } from 'mongoose';
import baseProblemSchema from "../core/schema";
import type { IProblem } from "../core/schema";

/**
 * 扩展问题集接口
 * @interface ExpandProblem
 * @extends IProblem
 * @property {string} category - 问题分类
 * @property {string[]} tags - 问题标签
 * @property {number} priority - 优先级
 * @property {string} description - 详细描述
 */
export interface ExpandProblem extends IProblem {
  category: string;      // 问题分类
  tags: string[];        // 问题标签
  priority: number;      // 优先级
  description: string;   // 详细描述
}

export type ExpandProblemDocument = Document<ExpandProblem>

// 定义问题集扩展模型的结构
const problemExpandSchema: SchemaDefinition<ExpandProblem> = R.mergeAll([
  baseProblemSchema,
  {
    category: {
      type: String,
      name: '问题分类',
      required: [true, '缺少问题分类'],
      default: '通用'
    },
    tags: {
      type: [String],
      name: '问题标签',
      default: []
    },
    priority: {
      type: Number,
      name: '优先级',
      min: [1, '优先级不能小于1'],
      max: [10, '优先级不能大于10'],
      default: 5
    },
    description: {
      type: String,
      name: '详细描述',
      maxlength: [5000, '详细描述长度不能超过5000字符'],
      sparse: true
    }
  } as SchemaDefinition<ExpandProblem>
]);

export default problemExpandSchema 