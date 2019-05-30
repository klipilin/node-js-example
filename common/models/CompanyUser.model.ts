import * as mongoose from 'mongoose';

//  interfaces
import { ICompanyUserDocument, ICompanyUserModel } from '../interfaces/company-user.interface';

// Models

/*
*  ============================== Imports END ==============================
*/

const allowedRoles = [
  'user',
  'admin',
  'owner'
];

const companyUserSchema = new mongoose.Schema({
  userID: {
    type      : mongoose.Types.ObjectId,
    required  : 'User is required',
  },
  companyID: {
    type      : mongoose.Types.ObjectId,
    required  : 'User is required',
  },
  role: {
    type      : String,
    default  : 'user',
  },
}, {
  timestamps  : true,
});

/*
*  ============================== Virtual properties ==============================
*/

/*
*  ============================== Mongo Hooks ==============================
*/

companyUserSchema
  .post('save',  async function() {
    if ( !allowedRoles.includes(this.role) ) {
      this.set('role', 'user');
    }
  });



/*
*  ==============================  Object Methods ==============================
*/

/*
*  ==============================  Statics Methods ==============================
*/

/*
*  ============================== Exports ==============================
*/

const CompanyUser = mongoose.model<ICompanyUserDocument, ICompanyUserModel>('CompanyUser', companyUserSchema);
export {
  CompanyUser,
  companyUserSchema,
};
export default CompanyUser;
