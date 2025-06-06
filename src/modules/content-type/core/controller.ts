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
  public eventStream =  async(ctx:ParameterizedContext)=>{
    console.log(ctx,11111)
    ctx.respond = false;
    ctx.status = 200
    // 设置响应头
    ctx.set({
        'Content-Type': 'text/event-stream', // 必须设置为 text/event-stream
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    // 直接向 ctx.res 写入数据
    let count = 0;
    const interval = setInterval(() => {
        if (count >= 4) {
            clearInterval(interval);
            // ctx.res.end(); // 结束响应
        }
        const data = { message: `Event ${count}`, timestamp: new Date() };
        ctx.res.write(`data: ${JSON.stringify(data)}\n\n`); // 写入符合 EventStream 规范的数据
        count++;
    }, 1000);

    // // 处理客户端断开连接
    // ctx.req.on('close', () => {
    //     ctx.res.end(); // 结束响应
    // });
  }
  public stream = async(ctx:ParameterizedContext)=>{
    // 设置响应头
    try{
      console.log(ctx.request.headers['content-type']);
      const streamMessage = `在使用 Koa 框架处理 HTTP 请求时，如果你遇到返回404错误但数据能够正常接收的情况，这通常表明你的请求路径没有被正确匹配到任何一个路由处理器（route handler）。下面是一些可能的原因和解决方法...`;

      switch (ctx.request.headers['content-type']) {
        case 'text/plain':
          ctx.respond = false;
          ctx.status = 200;
          console.log("text/plain");
           ctx.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          const text = streamMessage;
          for (let i = 0; i < text.length; i++) {
            ctx.res.write(text[i]); // 逐字写入响应流            
            await new Promise(resolve => setTimeout(resolve, 50)); // 每1000毫秒写入一个字
          }
          ctx.res.end(); // 结束响应流
          ctx.flush()
          break;
          //* ------------------------------------------- OK */

          // ctx.respond = false;
          // ctx.status = 200;
          // ctx.set({
          //   'Content-Type': 'text/event-stream',
          //   'Cache-Control': 'no-cache',
          //   'Connection': 'keep-alive'
          // });

          // const messages = [{content:1},{content:2},{content:3},{content:4},{content:5},{content:6},{content:7},];

          // const sendData = (data:any) => {
          //   ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
          // };

          // let index = 0;
          // const intervalId = setInterval(() => {
          //   if (index < messages.length) {
          //     const eventData = {
          //       choices: [
          //         {
          //           delta: {
          //             content: messages[index].content
          //           }
          //         }
          //       ]
          //     };
          //     sendData(eventData);
          //     index++;
          //   } else {
          //     sendData('[DONE]');
          //     clearInterval(intervalId);
          //     ctx.res.end();
          //   }
          // }, 1000);

        case 'application/json':
          console.log("application/json");
          ctx.set('Content-Type', 'application/json');
          ctx.body = packResponse({ code: 200, msg: '成功', data: { message: streamMessage } });
          break;

        default:
          ctx.set('Content-Type', 'application/json');
          ctx.body = packResponse({ code: 500, msg: '格式不明' });
          break;
      }
    }catch (err) {
      throw err;
    }
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