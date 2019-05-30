import * as mongoose from 'mongoose';
import * as Koa from 'koa';

export interface ICompany {
  _id: mongoose.Types.ObjectId|string;
  title: string;
  image: string;
  ownerID: mongoose.Types.ObjectId|string;

  createdAt?: Date|number;
  updatedAt?: Date|number;
  deletedAt?: Date|number;

  prepareApi(virtual: boolean, ctx: Koa.Context): this;
}

export type ICompanyDocument = ICompany & mongoose.Document;

export interface ICompanyModel extends mongoose.Model<ICompanyDocument> {
  checkIDExist(id: mongoose.Types.ObjectId|string, ctx: Koa.Context): boolean;
  getFullInfo(id: mongoose.Types.ObjectId, ctx: Koa.Context): this;
  checkCanCreate(user_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): this;
  checkCanEdit(user_id: mongoose.Types.ObjectId|string, company_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): boolean;
  checkRights(user_id: mongoose.Types.ObjectId, company_id: mongoose.Types.ObjectId, ctx: Koa.Context): boolean;
  prepareRequestParams(params: any, ctx: Koa.Context): this;
  getCompanyUsers(company_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): this;
  getCompanyUsersIDs(company_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): Promise<[]>;
  getCompanyAdmins(company_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): this;
  getCompanyAdminsIDs(company_id: mongoose.Types.ObjectId|string, ctx: Koa.Context): Promise<[]>;
}
