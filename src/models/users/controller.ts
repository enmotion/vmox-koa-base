// src/model/user/userController.ts
import { ParameterizedContext } from 'koa';
import User, { IUser } from './schema'; // 导入用户模型

// 创建用户
export async function createUser(ctx: ParameterizedContext):Promise<void>{
  const { username, password, email } = ctx.request.body;
  try {
    const newUser: IUser = new User({ username, password, email });
    await newUser.save();
    ctx.status = 200;
    ctx.body = { message: 'User created successfully', user: newUser };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { message: 'Error creating user', error };
  }
};

// 获取所有用户
export async function getAllUsers(ctx: ParameterizedContext):Promise<void> {
  try {
    console.log('errr')
    // const users: IUser[] = await User.find();
    // ctx.status = 200;
    ctx.body = {
      code:200,
      msg:'users/list111',
      data:[]
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: 'Error fetching users', error };
  }
};

// 其他用户相关的操作可以在这里添加