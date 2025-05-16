/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:55:04
 */
'use strict';
import { mongoDBErrorTransform } from "@lib/serviceTools";
import type { Model, Schema } from "mongoose";
import type { IUser } from "./schema";
import * as Colors from "colors";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useUserService<T extends IUser>(model:Model<T>){
  async function createUser(user:T){
    try{
      const data = await new model(user).save();
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, model.schema)
    }
  }
  async function deleteUser(user:T){
    try {
      const data = await model.deleteMany({uid:user.uid})
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, model.schema)
    }
  }
  async function updateUser(user:T){
    try{
      const data = await model.updateOne({uid:user.uid},{$set:user},{runValidators : true })
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, model.schema)
    }
  }
  async function findUser(user:T){
    try{
      const data = await model.find({uid:user.uid})
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, model.schema)
    }
  }
  return {
    createUser,
    deleteUser,
    updateUser,
    findUser,
  }
}