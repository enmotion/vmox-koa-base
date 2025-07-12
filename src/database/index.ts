'use strict';
import mongoDBInstance from "./mongoDB";
import qdrantInstance from "./qdrant";

export const mongoose = mongoDBInstance;
export const qdrantClient = qdrantInstance;