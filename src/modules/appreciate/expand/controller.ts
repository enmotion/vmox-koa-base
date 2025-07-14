/*
 * @Author: enmotion
 * @Date: 2025-05-07 12:25:12
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { AppreciateControllers } from "../core/controller";
import { ExpandAppreciateService } from "./service";
import type { ExpandAppreciate } from "./schema";

import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandAppreciateControllers<T extends ExpandAppreciate> extends AppreciateControllers<T> {
  public constructor(service: ExpandAppreciateService<T>, schema: Schema<T>) {
    super(service,schema)
  }
}