/*
 * @Author: enmotion
 * @Date: 2025-05-07 12:25:12
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:55
 */

"use strict";
import * as R from "ramda";
import { ParameterizedContext } from "koa";
import { ClientControllers } from "../core/controller";
import { ExpandClientService } from "./service";
import type { ExpandClient } from "./schema";

import { Schema } from "mongoose";
import { packResponse, fieldsFilter } from "@lib/serviceTools";

export class ExpandClientControllers<T extends ExpandClient> extends ClientControllers<T> {
  public constructor(service: ExpandClientService<T>, schema: Schema<T>) {
    super(service,schema)
  }
}