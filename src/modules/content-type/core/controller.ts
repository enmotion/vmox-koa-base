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
import { Schema, RootFilterQuery } from 'mongoose';
import { CategoryService } from './service';
import { TagService } from './service';
import { TagAssociationService } from './service';
import { getPagination, getSort } from "@lib/serviceTools";
import { ICategory, ITag, ITagAssociation } from './schema';
import { packResponse, fieldsFilter, getMongooseQueryFilter } from '@lib/serviceTools';

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
        { createdUser: ctx.visitor.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };
  
  public save = async (ctx:ParameterizedContext)=>{
    const body:Record<string,any> = ctx.request.body;
    if(!R.isNil(body) && !R.isEmpty(body)){
      const extraData = !body?._id ? { createdUser:ctx.visitor.uid } : {updatedUser:ctx.visitor.uid}
      const data:Record<string,any> = await this.service.save(R.mergeAll([body,extraData]) as T)
      const success = !body._id ? !R.isEmpty(data) : data.matchedCount > 0
      ctx.body = packResponse({
        code:success ? 200:400,
        data:data,
        msg:success ? '操作成功' : '出现异常'
      })
    }else{
      ctx.body = packResponse({code:300,msg:'缺少用户信息'})
    }
  }
  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(body, { '_ids': '_ids' });
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now();
      const data = await this.service.updateMany(
        { _id: { $in: filter._ids as string[] } },
        R.omit(['_ids'], body)
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
    if (!!ctx.query?._id && typeof ctx.query._id === 'string') {
      const _ids = ctx.query._id.split(',');
      const data = await this.service.deleteMany({ _id: { $in: _ids } });
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
      const filter = getMongooseQueryFilter(query);
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
    const query: Record<string, any> = ctx.request.body;
    if (!R.isNil(query) && !R.isEmpty(query)) {
       const filter = getMongooseQueryFilter(R.omit(['page','sort'],query));
      const page = getPagination(query.page) // 分页与排序转换
      const sort = getSort(query.sort) // 分页与排序转换
      const data = await this.service.find(filter,page,sort);
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        msg: !R.isEmpty(data) ? '操作成功' : '未找到分类',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
  public aggregate = async (ctx: ParameterizedContext)=>{
      const query:Record<string,any> = ctx.request.body??{};
      const filter = getMongooseQueryFilter(
        R.omit(['page','sort'],query),
        {
          "name":"name/$regex",
          "key":["key",(value)=>{ return {$regex:value, $options:'i'}}],
          "description":"description/$regex",
          "createdAt":"createdAt/$dateRange",
          "updatedAt":"updatedAt/$dateRange"
        }      
      ) as RootFilterQuery<T>// 请求值与查询条件的转换
      const page = getPagination(query.page) // 分页与排序转换
      const sort = getSort(query.sort) // 分页与排序转换
      // 查询模式下，超级管理员在列表中不可见
      const data = await this.service.aggregate(R.mergeAll([filter]), { password:0, __v:0, }, page, sort, [
        {
          $lookup:{
            from:"user-collections",
            localField: 'createdUser', 
            foreignField: 'uid',    // 目标集合的关联字段
            as: 'createdUserInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{username:1,nickname:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$createdUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $lookup:{
            from:"user-collections",
            localField: 'updatedUser', 
            foreignField: 'uid',    // 目标集合的关联字段
            as: 'updatedUserInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{username:1,nickname:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$updatedUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $addFields: {
            createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
          }
        },
      ])
      ctx.body = packResponse({
        code:!R.isEmpty(data[0].items)? 200 : 400, 
        msg:!R.isEmpty(data[0].items)?'操作成功':'未找到符合条件的标签',
        data:data[0]
      })
  }
}

export class TagController<T extends ITag, A extends ITagAssociation> {
  public service: TagService<T>;
  public AssociationService: TagAssociationService<A>;
  public schema: Schema<T>;

  public constructor(service: TagService<T>, schema: Schema<T>, associationService: TagAssociationService<A>) {
    this.service = service;
    this.AssociationService = associationService
    this.schema = schema;
  }
  public create = async (ctx: ParameterizedContext) => {
    try {
      const body = R.mergeAll([
        ctx.request?.body ?? {},
        { createdUser: ctx.visitor.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };
  
  public save = async (ctx:ParameterizedContext)=>{
    const body:Record<string,any> = ctx.request.body;
    if(!R.isNil(body) && !R.isEmpty(body)){
      const extraData = !body?._id ? { createdUser:ctx.visitor.uid } : {updatedUser:ctx.visitor.uid}
      const data:Record<string,any> = await this.service.save(R.mergeAll([body,extraData]) as T)
      const success = !body._id ? !R.isEmpty(data) : data.matchedCount > 0
      ctx.body = packResponse({
        code:success ? 200:400,
        data:data,
        msg:success ? '操作成功' : '出现异常'
      })
    }else{
      ctx.body = packResponse({code:300,msg:'缺少用户信息'})
    }
  }
  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(body, { '_ids': '_ids' });
      body.updatedUser = ctx.visitor.uid;
      body.updatedAt = Date.now();
      const data = await this.service.updateMany(
        { _id: { $in: filter._ids as string[] } },
        R.omit(['_ids'], body)
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
    if (!!ctx.query?._id && typeof ctx.query._id === 'string') {
      const _ids = ctx.query._id.split(',');
      const { items } = await this.service.find({ _id: { $in: _ids } }); // 找到要删除的
      this.AssociationService.deleteMany({tagId: { $in: items?.map?.(item=>item.key) } }) // 删除标签关联
      const data = await this.service.deleteMany({ _id: { $in: _ids } });
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
      const filter = getMongooseQueryFilter(query);
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
    const query: Record<string, any> = ctx.request.body;
    if (!R.isNil(query) && !R.isEmpty(query)) {
       const filter = getMongooseQueryFilter(R.omit(['page','sort'],query));
      const page = getPagination(query.page) // 分页与排序转换
      const sort = getSort(query.sort) // 分页与排序转换
      const data = await this.service.find(filter,page,sort);
      ctx.body = packResponse({
        code: !R.isEmpty(data) ? 200 : 400,
        msg: !R.isEmpty(data) ? '操作成功' : '未找到分类',
        data
      });
    } else {
      ctx.body = packResponse({ code: 300, msg: '请提供查询条件' });
    }
  };
  public aggregate = async (ctx: ParameterizedContext)=>{
      const query:Record<string,any> = ctx.request.body??{};
      const filter = getMongooseQueryFilter(
        R.omit(['page','sort'],query),
        {
          "name":"name/$regex",
          "key":["key",(value)=>{ return {$regex:value, $options:'i'}}],
          "description":"description/$regex",
          "createdAt":"createdAt/$dateRange",
          "updatedAt":"updatedAt/$dateRange"
        }      
      ) as RootFilterQuery<T>// 请求值与查询条件的转换
      const page = getPagination(query.page) // 分页与排序转换
      const sort = getSort(query.sort) // 分页与排序转换
      // 查询模式下，超级管理员在列表中不可见
      const data = await this.service.aggregate(R.mergeAll([filter]), { password:0, __v:0, }, page, sort, [
        {
          $lookup:{
            from:"user-collections",
            localField: 'createdUser', 
            foreignField: 'uid',    // 目标集合的关联字段
            as: 'createdUserInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{username:1,nickname:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$createdUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $lookup:{
            from:"user-collections",
            localField: 'updatedUser', 
            foreignField: 'uid',    // 目标集合的关联字段
            as: 'updatedUserInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{username:1,nickname:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$updatedUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $addFields: {
            createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
          }
        },
      ])
      ctx.body = packResponse({
        code:!R.isEmpty(data[0].items)? 200 : 400, 
        msg:!R.isEmpty(data[0].items)?'操作成功':'未找到符合条件的分类',
        data:data[0]
      })
  }
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
        { createdUser: ctx.visitor.uid, createdType: 'admin' }
      ]);
      const data = fieldsFilter.call(await this.service.save(body as any));
      return (ctx.body = packResponse({ data }));
    } catch (err) {
      throw err;
    }
  };
  public save = async (ctx:ParameterizedContext)=>{
    const body:Record<string,any> = R.clone(ctx.request.body);
    const alreadyHas = await this.service.find({categoryId:body.categoryId})
    const tagIds = body.tagId?.filter(((item:string)=>body.parentAssociationId!==item))
    delete body.tagId;
    if(!R.isNil(body) && !R.isEmpty(body)){
      const extraData = !body?._id ? { createdUser:ctx.visitor.uid } : {updatedUser:ctx.visitor.uid}
      const saveTasks = tagIds?.map((tagId:string, index:number)=>{
        return this.service.save(R.mergeAll([body,extraData,{tagId,order:alreadyHas.total+index+1}]) as T)
      })
      const data:Record<string,any> = await Promise.all(saveTasks)
      // console.log(R.mergeAll([body,extraData]),body)
      const success = !body._id ? !R.isEmpty(data) : data.matchedCount > 0
      ctx.body = packResponse({
        code:success ? 200:400,
        data:data,
        msg:success ? '操作成功' : '出现异常'
      })
    }else{
      ctx.body = packResponse({code:300,msg:'缺少用户信息'})
    }
  }
  public drop = async (ctx:ParameterizedContext)=>{
    const body:Record<string,any> = R.clone(ctx.request.body);
    console.log("ssss")
    if(!R.isNil(body) && !R.isEmpty(body)){
      switch(body.type){
        case 'inner':{
          const effectNodes = await (await this.service.find({parentAssociationId:body.parentAssociationId})).items
          const order = effectNodes.length>0 ? Math.min(...effectNodes.map(item=>item.order)) : 0;
          body.order = order - 1
          // console.log(order,'inner')
        }
        break;
        case "before":{
          const effectNodes = await (await this.service.find({parentAssociationId:body.parentAssociationId,order:{$lte:body.order},_id:{$ne:body._id}},null,{order:'desc'})).items
          let startOrder:number = body.order;
          await Promise.all(effectNodes.map((item)=>{
            startOrder--
            item.order = startOrder;
            return this.service.save(item)
          }))
          // console.log(body,'before')
        }
        break;
        case "after":{
          const effectNodes = await (await this.service.find({parentAssociationId:body.parentAssociationId,order:{$gte:body.order},_id:{$ne:body._id}},null,{order:'asc'})).items
          let startOrder:number = body.order;
          await Promise.all(effectNodes.map((item)=>{
            startOrder++
            item.order = startOrder;
            return this.service.save(item)
          }))
          // console.log(body,'after')
        }
      }
      const extraData = !body?._id ? { createdUser:ctx.visitor.uid } : {updatedUser:ctx.visitor.uid}
      const data:Record<string,any> = this.service.save(R.mergeAll([body,extraData]) as T)
      // console.log(R.mergeAll([body,extraData]),body)
      ctx.body = packResponse({
        code:200,
        data:data,
        msg:'操作成功'
      })
    }else{
      ctx.body = packResponse({code:300,msg:'缺少用户信息'})
    }
  }
  public update = async (ctx: ParameterizedContext) => {
    const body = R.clone(ctx.request?.body) as Record<string, any>;
    if (!R.isNil(body) && !R.isEmpty(body)) {
      const filter = getMongooseQueryFilter(body, {
        'categoryIds': 'categoryId',
        'tagIds': 'tagId'
      });
      body.updatedUser = ctx.visitor.uid;
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
    if (!!ctx.query?._id && typeof ctx.query._id === 'string') {
      const _ids = ctx.query._id.split(',');
      const data = await this.service.deleteMany({
        _id: { $in: _ids },
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
      const filter = getMongooseQueryFilter(query);
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
      const filter = getMongooseQueryFilter(query);
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
  public aggregate = async (ctx: ParameterizedContext)=>{
      const query:Record<string,any> = ctx.request.body??{};
      const filter = getMongooseQueryFilter(
        R.omit(['page','sort'],query),
        // {
        //   "name":"name/$regex",
        //   "key":["key",(value)=>{ return {$regex:value, $options:'i'}}],
        //   "description":"description/$regex",
        //   "createdAt":"createdAt/$dateRange",
        //   "updatedAt":"updatedAt/$dateRange"
        // }      
      ) as RootFilterQuery<T>// 请求值与查询条件的转换
      const page = getPagination(query.page) // 分页与排序转换
      const sort = getSort(query.sort) // 分页与排序转换
      // 查询模式下，超级管理员在列表中不可见
      const data = await this.service.aggregate(R.mergeAll([filter]), { password:0, __v:0, }, page, sort, [
        {
          $lookup:{
            from:"categories",
            localField: 'categoryId', 
            foreignField: 'key',    // 目标集合的关联字段
            as: 'categoryInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{name:1,key:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$createdUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $lookup:{
            from:"tags",
            localField: 'tagId', 
            foreignField: 'key',    // 目标集合的关联字段
            as: 'tagInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{name:1,key:1}}
            ]
          },
        },
        {
          $lookup:{
            from:"tags",
            localField: 'parentAssociationId', 
            foreignField: 'key',    // 目标集合的关联字段
            as: 'parentAssociationInfo',       // 存储匹配结果的临时字段
            pipeline:[
              {$project:{name:1,key:1}}
            ]
          },
        },
        { 
          $unwind: {
            path: '$updatedUserInfo',
            preserveNullAndEmptyArrays: true // 允许未匹配到创建者（如管理员创建的数据）
          } 
        },
        {
          $addFields: {
            createdUserName: '$creatorInfo.nickname' // 将用户名映射到新字段
          }
        },
      ])
      ctx.body = packResponse({
        code:!R.isEmpty(data[0].items)? 200 : 400, 
        msg:!R.isEmpty(data[0].items)?'操作成功':'未找到符合条件的分类标签',
        data:data[0]
      })
  }
} 