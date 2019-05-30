import * as Koa      from 'koa';
import * as mongoose from 'mongoose';

//  interfaces
import { ICompanyDocument, ICompanyModel }  from '../interfaces/company.interface';
import { IUserDocument }        from '../interfaces/user.interface';
import { ICompanyUserDocument } from '../interfaces/company-user.interface';

// Models
import { User }         from './User.model';
import { CompanyUser }  from './CompanyUser.model';

// Helpers
import ErrorHelper      from '../helpers/error.helper';

/*
*  ============================== Imports END ==============================
*/

const companySchema = new mongoose.Schema({
  title: {
    type      : String,
    required  : 'title is required',
  },
  image: {
    type      : String
  },
  ownerID: {
    type      : mongoose.Types.ObjectId,
    required  : 'User is required',
  }
}, {
  timestamps  : true,
});

/*
*  ============================== Virtual properties ==============================
*/

companySchema
  .virtual('workspaces', {
    ref: 'Workspace',
    localField: '_id',
    foreignField: 'companyID',
    justOne: false
  });

companySchema
  .virtual('owner', {
    ref: 'User',
    localField: 'ownerID',
    foreignField: '_id',
    justOne: true
  });

companySchema
  .virtual('users', {
    ref: 'CompanyUser',
    localField: '_id',
    foreignField: 'companyID',
    justOne: false
  });

companySchema
  .virtual('admins', {
    ref: 'CompanyUser',
    localField: '_id',
    foreignField: 'companyID',
    justOne: false,
    options: {select: {userID: 1}, match: {role: 'admin'}}
  });

/*
*  ============================== Mongo Hooks ==============================
*/

/*
*  ==============================  Object Methods ==============================
*/

/*
* @this : ICompanyDocument
* Return {} without excess fields
 */
companySchema.methods.prepareApi = async function ( virtual: boolean , ctx: Koa.Context) {
  const  resource = this.toJSON({ virtuals: virtual });

  delete resource.id;

  delete resource.createdAt;
  delete resource.updatedAt;
  delete resource.__v;

  resource.canEdit  = await Company.checkCanEdit(ctx.User._id, resource._id, ctx) || false;

  return resource;
};

/*
*  ==============================  Statics Methods ==============================
*/

companySchema.statics.getFullInfo = async (id: mongoose.Types.ObjectId, ctx: Koa.Context) => {
    return Company
      .findOne({ _id: id })
      .populate({ path : 'owner'})
      .populate({ path : 'users'})
      .populate({ path : 'admins'})
      .populate({ path : 'workspaces'})
      .exec()
      .then( async (company: any) => {
        company.owner = await company.owner.prepareApi(false);
        company.owner.role = 'owner';
        return company;
      })
      .then(async (company: any) => {
        company.admins = await Company.getCompanyAdmins(id, ctx);
        return company;
      })
      .then(async (company: any) => {
        company.users = await Company.getCompanyUsers(id, ctx);
        return company;
      })
      .then(async (company: any) => {
        company.workspaces = await Promise.all(
          company.workspaces.map( async (ws: any) => {
            return ws.prepareApi(false, ctx);
          })
        );
        return company;
      })
      .then( (company: ICompanyDocument) => {
        return company.prepareApi(true, ctx);
      });
};

/*
* return true if exist
* return boolean
*/
companySchema.statics.checkIDExist = async (id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<boolean> => {
  const exist = await Company.countDocuments({_id: id} ).exec();
  if ( exist ) {
    return true;
  } else {
    ctx.success = false;
    ErrorHelper.notExistError(ctx, String(id), 'Company');
    return false;
  }
};

/*
* check existing Users Company (one User can be owner only one Company)
*/
companySchema.statics.checkCanCreate = async function (user_id: mongoose.Types.ObjectId, ctx: Koa.Context) {
  const existCompany = await Company
    .countDocuments({
      ownerID: user_id
    })
    .exec();

  if ( existCompany ) {
    ErrorHelper.customError(ctx, {
      'param' : 'company.ownerID',
      'msg'   : 'User Already have Company'
    });
    return false;
  } else {
    return true;
  }
};

/*
* Check if current User is Admin or Owner of Company
*/
companySchema.statics.checkCanEdit = async function (user_id: mongoose.Types.ObjectId, company_id: mongoose.Types.ObjectId, ctx: Koa.Context) {
  const company_admins =  await CompanyUser
    .find({companyID: company_id, role: { '$in' : ['admin', 'owner'] } } )
    .exec();

  const admin_exist    = await company_admins
    .filter( (company_user: ICompanyUserDocument) => {
      return String(company_user.userID) == String(user_id);
    });

  return !!( admin_exist.length );
};

/*
* Check if current User is in Company User array
*/
companySchema.statics.checkRights = async function (user_id: mongoose.Types.ObjectId, company_id: mongoose.Types.ObjectId, ctx: Koa.Context) {
  const company_users  = await CompanyUser
    .find({companyID: company_id})
    .exec();

  const user_exist    = await company_users
    .filter( (company_user: ICompanyUserDocument) => {
      return String(company_user.userID) == String(user_id);
    });

  return !!( user_exist.length );
};

/*
*/
companySchema.statics.prepareRequestParams = async function ( params: any, ctx: Koa.Context ) {
  const allowedToUpdate = [
    'title',
    'image'
  ];

  return Object
    .keys(params)
    .filter( key => allowedToUpdate.includes(key) )
    .reduce((obj, key) => {
      let param: any = params[key];
      return { ...obj, [key]: param };
    }, {});
};

/*
*/
companySchema.statics.getCompanyUsers = async function (company_id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<IUserDocument[]> {
  let usersCollection: IUserDocument[] = [];
  let companyAdminsIDs = await this.getCompanyAdminsIDs(company_id, ctx);
      companyAdminsIDs = await companyAdminsIDs.map( (idc: mongoose.Types.ObjectId) => {
          return String(idc);
      });

  const company   = await this.findById(company_id).exec();
  const userIDs   = await this.getCompanyUsersIDs(company_id, ctx);

  if ( userIDs.length ) {
    usersCollection = await User
      .find({ '_id': { $in: userIDs }})
      .exec();

    usersCollection = await Promise.all(
      usersCollection.map( async (user: any) => {
        let userResponse      =  await user.prepareApi(false, ctx);
            userResponse.role = ( String(user._id) == String(company.ownerID) ) ? 'owner' : ( companyAdminsIDs.includes(String(user._id)) ) ? 'admin' : 'user';
        return userResponse;
      })
    );
  }
  return usersCollection;
};

/*
*/
companySchema.statics.getCompanyUsersIDs = async function (company_id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<[]> {
  const company_users: any =  await CompanyUser
    .find({companyID: company_id} )
    .exec();

  return await company_users.map( ( userIn: any ) => {
    return userIn.userID;
  });
};

/*
*/
companySchema.statics.getCompanyAdminsIDs = async function (company_id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<[]> {
  const company_admins: any =  await CompanyUser
    .find({companyID: company_id, role: { '$in' : ['admin', 'owner'] } } )
    .exec();

  return await company_admins.map( ( userIn: any ) => {
    return userIn.userID;
  });

};

/*
*/
companySchema.statics.getCompanyAdmins = async function (company_id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<IUserDocument[]> {
  let adminsCollection: any = [];
  const company_admins_ids  = await this.getCompanyAdminsIDs(company_id, ctx);

  if ( company_admins_ids.length ) {

    adminsCollection = await User
      .find({ '_id': { $in: company_admins_ids }})
      .exec();

    adminsCollection = await Promise.all(
      adminsCollection.map( async (user: IUserDocument) => {
        let user_response: any  =  await user.prepareApi(false, ctx);
        user_response.role      = 'admin';
        return user_response;
      })
    );

  }
  return adminsCollection;
};

/*
*  ============================== Exports ==============================
*/

const Company = mongoose.model<ICompanyDocument, ICompanyModel>('Company', companySchema);
export {
  Company,
  companySchema,
};
export default Company;
