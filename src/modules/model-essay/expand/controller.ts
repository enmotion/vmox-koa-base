/*
 * @Author: enmotion
 * @Date: 2025-05-07 12:25:12
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { ProblemControllers } from "../core/controller";
import { ExpandModelEssayService } from "./service";
import type { ExpandModelEssay } from "./schema";

import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandModelEssayControllers<T extends ExpandModelEssay> extends ProblemControllers<T> {
  public constructor(service: ExpandModelEssayService<T>, schema: Schema<T>) {
    super(service,schema)
  }
}