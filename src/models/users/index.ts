import Router from 'koa-router';
import { userSchema, type IUser } from "./core/schema";
import type { ParameterizedContext } from "koa";
import type { Mongoose } from "mongoose";
import { useUserService } from "./core/service";
import { useUserController } from "./core/controller";

export function userUserModel(mongoose:Mongoose,prefix:string='/users'){
  const userModel = mongoose.model<IUser>('user',userSchema)
  const userService = useUserService(userModel)
  const controller = useUserController(userService);
  const router = new Router({prefix: prefix});
  router.post('create',controller.create)
  router.post('delete',controller.delete)
  router.post('update',controller.update)
  router.get('/find',controller.find)
  return {
    userModel,
    userService,
    controller,
    router
  }
}