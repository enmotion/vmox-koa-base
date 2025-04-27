import { Model } from "mongoose";
import type { IUser } from "./schema";

/**
 * 
 * @param model 
 * @returns 
 */
export function useUserService(model:Model<IUser>){
  async function createUser(user:IUser){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function deleteUser(user:IUser){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function updateUser(user:IUser){
    const userModel = new model(user);
    return await userModel.save()
  }
  async function findUser(user:IUser){
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