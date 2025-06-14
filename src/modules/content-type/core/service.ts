/*
 * 内容分类标签服务模块 - 提供基于Mongoose的CRUD操作
 * @Author: enmotion
 * @Date: 2025-05-22 12:23:41
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 12:34:37
 */
'use strict';

import { Model, MongooseBaseQueryOptions, QueryOptions, RootFilterQuery, SaveOptions } from 'mongoose';
import mongoose from 'mongoose';
import MongoDB from 'mongodb'
import { CoreService } from 'src/frame-work-core/service';
import { ICategory, ITag, ITagAssociation } from './schema';
import { DeleteOptions, DeleteResult } from 'mongodb';

export class CategoryService<T extends ICategory> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }

  public override async save(category: T, options?: SaveOptions): Promise<any> {
    if (await super.findOne({ _id: category._id })) {
      return super.updateOne({ _id: category._id }, category);
    }
    return super.save(category, options);
  }
}

export class TagService<T extends ITag> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }

  public override async save(category: T, options?: SaveOptions): Promise<any> {
    if (await super.findOne({ _id: category._id })) {
      return super.updateOne({ _id: category._id }, category);
    }
    return super.save(category, options);
  }
}

export class TagAssociationService<T extends ITagAssociation> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }
  public override async deleteMany(
    filter: RootFilterQuery<T>,
    options?: (MongoDB.DeleteOptions & MongooseBaseQueryOptions<T>) | null
  ): Promise<DeleteResult> {
    const session = await mongoose.startSession();
    session.startTransaction()
    try{
      const targets = await super.find(filter);
      const updateArray = targets.items.map((item)=>super.updateMany({categoryId:item.categoryId, parentAssociationId:item.tagId},{parentAssociationId:item.parentAssociationId}))
      await Promise.all(updateArray);
      const data = await super.deleteMany(filter);
      session.endSession()
      return data;
    }catch(err){
      session.abortTransaction()
      throw err
    }
  }
  public override async save(association: T, options?: SaveOptions): Promise<any> {
    if (association._id) {
      return super.updateOne(
        { _id:association._id},
        association
      );
    }
    return super.save(association, options);
  }
} 