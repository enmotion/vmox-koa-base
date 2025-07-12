/*
 * 内容分类标签模块入口
 * @Author: enmotion
 * @Date: 2025-05-22 12:23:41
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 12:34:37
 */
'use strict';

import mongoose, { Schema } from 'mongoose';
import { mappingControllersAndRouter } from '@lib/routerTools';
import { AppControllers } from './core/controller';
// 路由前缀配置
const _routerPrefix='/app';
const appcontrollers = new AppControllers()
export const appPublicRouter = mappingControllersAndRouter<AppControllers>(
  _routerPrefix,
  appcontrollers,
  [
    { routerPath: '/propblem', method: 'post', handlerName: 'aggregatePropblem' },
    { routerPath: '/tagAssociation', method: 'put', handlerName: 'aggregateTagAssociationService' },
  ]
);