import { Model } from "mongoose";
import type { IUser } from "./schema";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useUserService<T extends IUser>(model:Model<T>){
  async function createUser(user:T){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function deleteUser(user:T){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function updateUser(user:T){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function findUser(user:T){
    const userModel = new model(user);
    return await userModel.save()
  }
  return {
    createUser,
    deleteUser,
    updateUser,
    findUser,
  }
}