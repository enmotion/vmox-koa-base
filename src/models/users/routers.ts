import Router from 'koa-router';
import { createUser, getAllUsers } from './controller';

const router = new Router({prefix: '/users'});

// 定义用户相关的路由
router.post('/create', createUser); // 创建用户
router.get('/list', getAllUsers); // 获取所有用户

export default router; // 导出路由