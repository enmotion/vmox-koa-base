/*
 * @Author: enmotion
 * @Date: 2025-05-07 12:25:12
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { UserControllers } from "../core/controller";
import { ExpandUserService } from "./service";
import type { ExpandUser } from "./schema";

import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandUserControllers<T extends ExpandUser> extends UserControllers<T> {
  public constructor(service: ExpandUserService<T>, schema: Schema<T>) {
    super(service,schema)
  }
}