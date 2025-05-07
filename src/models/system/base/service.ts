/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:55:04
 */
'use strict';
import { userService } from "@model/users";
import type { ExpandUser } from "@model/users";
import { mongoDBErrorTransform } from "@lib/serviceTools";
import type { Model, Schema } from "mongoose";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useSystemService<T extends Record<string,any>>(model:Model<T>, schema:Schema){
  async function register(user:ExpandUser){
    try{
      const data = await userService.createUser(user)
      return data
    }catch(err){
      throw mongoDBErrorTransform(err, schema)
    }
  }
  async function login(user:Partial<ExpandUser>){

  }
  return {
    register,
    login,
  }
}