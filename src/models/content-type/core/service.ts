/*
 * 内容分类标签服务模块 - 提供基于Mongoose的CRUD操作
 * @Author: enmotion
 * @Date: 2025-05-22 12:23:41
 * @Last Modified by: enmotion
 * @Last Modified time: 2025-05-22 12:34:37
 */
'use strict';

import { Model, SaveOptions } from 'mongoose';
import { CoreService } from 'src/frame-work-core/service';
import { ICategory, ITag, ITagAssociation } from './schema';

export class CategoryService<T extends ICategory> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }

  public override async save(category: T, options?: SaveOptions): Promise<any> {
    if (category.key) {
      return super.updateOne({ key: category.key }, category);
    }
    return super.save(category, options);
  }
}

export class TagService<T extends ITag> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }

  public override async save(tag: T, options?: SaveOptions): Promise<any> {
    if (tag.key) {
      return super.updateOne({ key: tag.key }, tag);
    }
    return super.save(tag, options);
  }
}

export class TagAssociationService<T extends ITagAssociation> extends CoreService<T> {
  public constructor(model: Model<T>) {
    super(model);
  }

  public override async save(association: T, options?: SaveOptions): Promise<any> {
    if (association.categoryId && association.tagId) {
      return super.updateOne(
        { categoryId: association.categoryId, tagId: association.tagId },
        association
      );
    }
    return super.save(association, options);
  }
} 