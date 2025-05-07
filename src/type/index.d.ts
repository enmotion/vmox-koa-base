/*
 * @Author: enmotion 
 * @Date: 2025-05-07 12:25:12 
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-07 12:25:47
 */

"use strict"

export type AppResponse = {
  code:number,
  msg:string|null,
  data:Record<string,any>
}