import Router from 'koa-router';
import { useUserController } from './controller';

export function useUserRouter(prefix:`/${string}`, controllers:ReturnType<typeof useUserController>){
  const router = new Router({prefix: prefix}); // 创建路由实例
  router.post('/create',controllers.create) // 注入controller 创建具体路由
  router.post('/delete',controllers.delete)
  router.post('/update',controllers.update)
  router.get('/find',controllers.find)
  return router
}