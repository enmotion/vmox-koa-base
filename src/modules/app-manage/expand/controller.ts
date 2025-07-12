/*
 * @Author: enmotion
 * @Date: 2025-05-07 12:25:12
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { AppControllers } from "../core/controller";
import { ExpandAppService } from "./service";
import type { ExpandApp } from "./schema";

import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandAppControllers<T extends ExpandApp> extends AppControllers<T> {
  public constructor(service: ExpandAppService<T>, schema: Schema<T>) {
    super(service,schema)
  }
}