import * as mongoose  from 'mongoose';

export interface ICompanyUser {
  _id: mongoose.Types.ObjectId|string;
  userID: mongoose.Types.ObjectId;
  companyID: mongoose.Types.ObjectId;
  role: string;

  createdAt?: Date|number;
  updatedAt?: Date|number;
  deletedAt?: Date|number;

}

export type ICompanyUserDocument = ICompanyUser & mongoose.Document;

export interface ICompanyUserModel extends mongoose.Model<ICompanyUserDocument> {

}
