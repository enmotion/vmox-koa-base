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
import { CoreService } from 'src/frame-work-core/service';
import { ICategory, ITag, ITagAssociation, categorySchemaConfig, tagSchemaConfig, tagAssociationSchemaConfig } from './core/schema';
import { CategoryService, TagService, TagAssociationService } from './core/service';
import { CategoryController, TagController, TagAssociationController } from './core/controller';

// 路由前缀配置
const _routerPrefix = '/content-type';

// 创建模型
const categoryModel = mongoose.model<ICategory>('Category', new Schema<ICategory>(categorySchemaConfig));
const tagModel = mongoose.model<ITag>('Tag', new Schema<ITag>(tagSchemaConfig));
const tagAssociationModel = mongoose.model<ITagAssociation>('TagAssociation', new Schema<ITagAssociation>(tagAssociationSchemaConfig));

tagAssociationModel.schema.index({categoryId:1,tagId:1},{unique:true, sparse:true}) // 设置标签关联表双主键唯一

// 创建服务实例
const categoryService = new CategoryService<ICategory>(categoryModel);
const tagService = new TagService<ITag>(tagModel);
const tagAssociationService = new TagAssociationService<ITagAssociation>(tagAssociationModel);

// 创建控制器实例
const categoryController = new CategoryController<ICategory>(
  categoryService,
  new Schema<ICategory>(categorySchemaConfig)
);
const tagController = new TagController<ITag, ITagAssociation>(
  tagService,
  new Schema<ITag>(tagSchemaConfig),
  tagAssociationService
);
const tagAssociationController = new TagAssociationController<ITagAssociation>(
  tagAssociationService,
  new Schema<ITagAssociation>(tagAssociationSchemaConfig)
);

// 创建路由
export const categoryRouter = mappingControllersAndRouter<CategoryController<ICategory>>(
  `${_routerPrefix}/category`,
  categoryController,
  [
    { routerPath: '/', method: 'post', handlerName: 'save' },
    { routerPath: '/', method: 'put', handlerName: 'update' },
    { routerPath: '/', method: 'delete', handlerName: 'delete' },
    { routerPath: '/find', method: 'post', handlerName: 'aggregate' },
    { routerPath: '/', method: 'get', handlerName: 'findOne' },
  ]
);

export const tagRouter = mappingControllersAndRouter<TagController<ITag, ITagAssociation>>(
  `${_routerPrefix}/tag`,
  tagController,
  [
    { routerPath: '/', method: 'post', handlerName: 'save' },
    { routerPath: '/', method: 'put', handlerName: 'update' },
    { routerPath: '/', method: 'delete', handlerName: 'delete' },
    { routerPath: '/find', method: 'post', handlerName: 'aggregate' },
    { routerPath: '/', method: 'get', handlerName: 'findOne' },
  ]
);

export const tagAssociationRouter = mappingControllersAndRouter<TagAssociationController<ITagAssociation>>(
  `${_routerPrefix}/association`,
  tagAssociationController,
  [
    { routerPath: '/', method: 'post', handlerName: 'save' },
    { routerPath: '/', method: 'put', handlerName: 'update' },
    { routerPath: '/', method: 'delete', handlerName: 'delete' },
    { routerPath: '/drop', method: 'post', handlerName: 'drop' },
    { routerPath: '/find', method: 'post', handlerName: 'aggregate' },
    { routerPath: '/one', method: 'get', handlerName: 'findOne' }
  ]
);

export {
  // 接口
  ICategory,
  ITag,
  ITagAssociation,
  // Schema
  categorySchemaConfig,
  tagSchemaConfig,
  tagAssociationSchemaConfig,
  // 模型
  categoryModel,
  tagModel,
  tagAssociationModel,
  // 服务
  categoryService,
  tagService,
  tagAssociationService,
  // 控制器
  categoryController,
  tagController,
  tagAssociationController
}; 