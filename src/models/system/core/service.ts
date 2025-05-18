/*
 * @Author: enmotion 
 * @Date: 2025-04-29 08:50:46 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-04-29 12:55:04
 */
'use strict';
import { userService } from "@model/users-class";
import type { ExpandUser } from "@model/users-class";
import { mongoDBErrorTransform } from "@lib/serviceTools";
import type { Model, Schema } from "mongoose";

/**
 * 
 * @param model 
 * @returns 
 */
export default function useSystemService<T extends Record<string,any>>(){
  async function registerSystem(user:ExpandUser){
    try{
      const data = await userService.create(user)
      return data
    }catch(err){
      throw err
    }
  }
  async function login(user:Partial<ExpandUser>){

  }
  return {
    registerSystem,
    login,
  }
}