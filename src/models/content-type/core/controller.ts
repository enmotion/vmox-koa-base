/*
 * 内容分类标签控制器模块 - 处理HTTP请求
 * @Author: enmotion
 * @Date: 2025-05-22 12:23:41
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 12:34:37
 */
'use strict';

import * as R from 'ramda';
import { ParameterizedContext } from 'koa';
import { Schema } from 'mongoose';
import { CategoryService } from './service';
import { TagService } from './service';
import { TagAssociationService } from './service';
import { ICategory, ITag, ITagAssociation } from './schema';
import { packResponse, fieldsFilter, getFilter } from '@lib/serviceTools';

export class CategoryController<T extends ICategory> {
  public service: CategoryService<T>;
  public schema: Schema<T>;

  public constructor(service: CategoryService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }

  public create = async (ctx: ParameterizedContext) => {
    try {
      const body = R.mergeAll([
        ctx.request?.body ?? {},
        { createdUser: ctx.token.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };

  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body, { 'keys': 'key' });
      body.updatedUser = ctx.token.uid;
      body.updatedAt = Date.now();
      const data = await this.service.updateOne(
        { key: { $in: filter.key as string[] } },
        R.omit(['key'], body)
      );
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0
          ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]`
          : '未找到可更新的分类',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的分类信息' });
    }
  };

  public delete = async (ctx: ParameterizedContext) => {
    if (!!ctx.query?.key && typeof ctx.query.key === 'string') {
      const keys = ctx.query.key.split(',');
      const data = await this.service.deleteMany({ key: { $in: keys } });
      return (ctx.body = packResponse({
        code: data.deletedCount > 0 ? 200 : 400,
        msg: data.deletedCount > 0
          ? `操作成功，删除[${data.deletedCount}]`
          : '未找到可删除的分类',
        data
      }));
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要删除的分类标识' });
    }
  };

  public findOne = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = fieldsFilter.call(await this.service.findOne(filter));
      ctx.body = packResponse({
        code: !R.isNil(data) ? 200 : 400,
        msg: !R.isNil(data) ? '操作成功' : '未找到分类',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  public find = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = await this.service.find(filter);
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        msg: !R.isEmpty(data) ? '操作成功' : '未找到分类',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
}

export class TagController<T extends ITag> {
  public service: TagService<T>;
  public schema: Schema<T>;

  public constructor(service: TagService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }

  public create = async (ctx: ParameterizedContext) => {
    try {
      const body = R.mergeAll([
        ctx.request?.body ?? {},
        { createdUser: ctx.token.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };

  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body, { 'keys': 'key' });
      body.updatedUser = ctx.token.uid;
      body.updatedAt = Date.now();
      const data = await this.service.updateOne(
        { key: { $in: filter.key as string[] } },
        R.omit(['key'], body)
      );
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0
          ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]`
          : '未找到可更新的标签',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的标签信息' });
    }
  };

  public delete = async (ctx: ParameterizedContext) => {
    if (!!ctx.query?.key && typeof ctx.query.key === 'string') {
      const keys = ctx.query.key.split(',');
      const data = await this.service.deleteMany({ key: { $in: keys } });
      return (ctx.body = packResponse({
        code: data.deletedCount > 0 ? 200 : 400,
        msg: data.deletedCount > 0
          ? `操作成功，删除[${data.deletedCount}]`
          : '未找到可删除的标签',
        data
      }));
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要删除的标签标识' });
    }
  };

  public findOne = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = fieldsFilter.call(await this.service.findOne(filter));
      ctx.body = packResponse({
        code: !R.isNil(data) ? 200 : 400,
        msg: !R.isNil(data) ? '操作成功' : '未找到标签',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  public find = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = await this.service.find(filter);
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        msg: !R.isEmpty(data) ? '操作成功' : '未找到标签',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
}

export class TagAssociationController<T extends ITagAssociation> {
  public service: TagAssociationService<T>;
  public schema: Schema<T>;

  public constructor(service: TagAssociationService<T>, schema: Schema<T>) {
    this.service = service;
    this.schema = schema;
  }

  public create = async (ctx: ParameterizedContext) => {
    try {
      const body = R.mergeAll([
        ctx.request?.body ?? {},
        { createdUser: ctx.token.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };

  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getFilter(body, {
        'categoryIds': 'categoryId',
        'tagIds': 'tagId'
      });
      body.updatedUser = ctx.token.uid;
      body.updatedAt = Date.now();
      const data = await this.service.updateOne(
        {
          categoryId: { $in: filter.categoryId as string[] },
          tagId: { $in: filter.tagId as string[] }
        },
        R.omit(['categoryId', 'tagId'], body)
      );
      ctx.body = packResponse({
        code: data.matchedCount > 0 ? 200 : 400,
        msg: data.matchedCount > 0
          ? `操作成功，匹配[${data.matchedCount}]，更新[${data.modifiedCount}]`
          : '未找到可更新的标签关联',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要更新的标签关联信息' });
    }
  };

  public delete = async (ctx: ParameterizedContext) => {
    if (!!ctx.query?.categoryId && typeof ctx.query.categoryId === 'string' &&
        !!ctx.query?.tagId && typeof ctx.query.tagId === 'string') {
      const categoryIds = ctx.query.categoryId.split(',');
      const tagIds = ctx.query.tagId.split(',');
      const data = await this.service.deleteMany({
        categoryId: { $in: categoryIds },
        tagId: { $in: tagIds }
      });
      return (ctx.body = packResponse({
        code: data.deletedCount > 0 ? 200 : 400,
        msg: data.deletedCount > 0
          ? `操作成功，删除[${data.deletedCount}]`
          : '未找到可删除的标签关联',
        data
      }));
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供需要删除的标签关联标识' });
    }
  };

  public findOne = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = fieldsFilter.call(await this.service.findOne(filter));
      ctx.body = packResponse({
        code: !R.isNil(data) ? 200 : 400,
        msg: !R.isNil(data) ? '操作成功' : '未找到标签关联',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };

  public find = async (ctx: ParameterizedContext) => {
    const query: Record<string, any> = ctx.query;
    if (!R.isNil(query) && !R.isEmpty(query)) {
      const filter = getFilter(query);
      const data = await this.service.find(filter);
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        msg: !R.isEmpty(data) ? '操作成功' : '未找到标签关联',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
} 