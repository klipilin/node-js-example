import * as Koa       from 'koa';
import * as mongoose  from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId|string;
  name: string;
  email: string;
  timeZone: string;
  language: string;
  isIndependent: boolean;

  passwordHash: string;
  salt: string;
  pending: boolean;

  createdAt?: Date|number;
  updatedAt?: Date|number;
  deletedAt?: Date|number;

  checkPassword(password: string): this;
  prepareApi(virtual: boolean, ctx: Koa.Context): this;
}

export type IUserDocument = IUser & mongoose.Document;

export interface IUserModel extends mongoose.Model<IUserDocument> {
  getFullInfo(id: mongoose.Types.ObjectId, ctx: Koa.Context): this;
  getUserCompanies(id: mongoose.Types.ObjectId, ctx: Koa.Context): this;
  checkIDExist(id: mongoose.Types.ObjectId|string, ctx: Koa.Context): this;
  checkEmailExist(email: String, ctx: Koa.Context): this;
  checkRights(current_user_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId, ctx: Koa.Context): this;
  prepareRequestParams(params: any, ctx: Koa.Context): this;
}
