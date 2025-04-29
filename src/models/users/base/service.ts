/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 11:05:56
 */
'use strict';
import mongoose from "mongoose";
import { mongoDBErrorTransform } from "@lib/serviceTools";
import type { Model, MongooseError, Schema } from "mongoose";
import type { IUser } from "./schema";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useUserService<T extends IUser>(model:Model<T>, schema:Schema){
  async function createUser(user:T){
    try{
      const d:Record<string,any>={}
      const data = await new model(user).save();
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, schema)
    }
  }
  async function deleteUser(user:T){
    try {
      const data = await model.deleteMany({uid:user.uid})
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, schema)
    }
  }
  async function updateUser(user:T){
    try{
      const data = await model.updateOne({uid:user.uid},{$set:user},{runValidators : true })
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, schema)
    }
  }
  async function findUser(user:T){
    try{
      const data = await model.find({uid:user.uid})
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, schema)
    }
  }
  return {
    createUser,
    deleteUser,
    updateUser,
    findUser,
  }
}