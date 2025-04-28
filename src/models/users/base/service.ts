'use strict';
import { Model } from "mongoose";
import type { IUser } from "./schema";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useUserService<T extends IUser>(model:Model<T>){
  async function createUser(user:T){
    const modelDoc = new model(user);
    return await modelDoc.save()
  }
  async function deleteUser(user:T){
    return await model.deleteMany({uid:user.uid})
  }
  async function updateUser(user:T){
    return await model.updateOne({uid:user.uid},{$set:user},{runValidators : true })
  }
  async function findUser(user:T){
    return await model.find({uid:user.uid})
  }
  return {
    createUser,
    deleteUser,
    updateUser,
    findUser,
  }
}