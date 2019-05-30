import * as Koa       from 'koa';
import * as mongoose  from 'mongoose';
import * as crypto    from 'crypto';

// Interfaces
import { IUserModel, IUserDocument }  from '../interfaces/user.interface';
import { ICompanyDocument }           from '../interfaces/company.interface';

// Models
import { CompanyUser }  from './CompanyUser.model';
import { Company }      from './Company.model';

// Helpers
import ErrorHelper      from '../helpers/error.helper';

/*
* ============================== Imports END ==============================
*/

const userSchema = new mongoose.Schema({
  name: {
    type        : String,
    default    : 'User',
  },
  email: {
    type        : String,
    required    : 'Email is required',
    unique      : 'This Email already exists'
  },
  timeZone: {
    type        : String,
    default     : 'Etc/UTC',
  },
  language: {
    type        : String,
    default     : 'en',
  },
  // /auth/sign-up or /company/:id/create-user
  isIndependent: {
    type        : Boolean,
    default     : true,
  },
  passwordHash  : String,
  salt          : String,
  pending: {
    type        : Boolean,
    default     : true,
  },
}, {
  timestamps    : true,
});

/*
* ============================== Virtual properties ==============================
*/

userSchema
  .virtual('companies', {
    ref: 'CompanyUser',
    localField: '_id',
    foreignField: 'userID',
    justOne: false,
  });


userSchema
  .virtual('password')
    .set(function (password: any) {
      this._plainPassword = password;
      if (password) {
        this.salt = crypto.randomBytes(128).toString('base64');
        this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
      } else {
        this.salt = undefined;
        this.passwordHash = undefined;
      }
    })
    .get(function () {
      return this._plainPassword;
    });

/*
*  ============================== Mongo Hooks ==============================
*/


/*
*  ==============================  Object Methods ==============================
*/

userSchema.methods.checkPassword = function (password: string) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

/*
* @this : IUserDocument
* Return {} without excess fields
 */
userSchema.methods.prepareApi = async function ( virtual: boolean, ctx: Koa.Context ) {
  const  resource = this.toJSON({ virtuals: virtual });

  delete resource.isIndependent;

  delete resource.password;
  delete resource.passwordHash;
  delete resource.salt;

  delete resource.createdAt;
  delete resource.updatedAt;

  delete resource.__v;
  delete resource.id;

  return resource;
};


/*
*  ==============================  Static Methods ==============================
*/

/*
*/
userSchema.statics.prepareRequestParams = async function ( params: any, ctx: Koa.Context ) {
  const allowedToUpdate = [
    'name',
    'email',
    'password',
    'timeZone',
    'password',
    'language',
    'pending'
  ];

  return Object
    .keys(params)
    .filter( key => allowedToUpdate.includes(key) )
    .reduce( (obj, key) => {
      let param: any = params[key];
      return { ...obj, [key]: param };
    }, {});
};

userSchema.statics.getFullInfo = async (id: mongoose.Types.ObjectId, ctx: Koa.Context) => {
  try {
    return User
      .findOne({_id: id})
      .populate({
        path: 'companies'
      })
      .exec()
      .then( async (user: any) => {
        user.companies = await User.getUserCompanies(id, ctx);
        return user;
      })
      .then((user: IUserDocument) => {
        return user.prepareApi(true, ctx);
      });
  } catch (e) {
    console.log(e);
    return {};
  }
};

/*
* return true if exist
* return boolean
*/
userSchema.statics.checkIDExist = async (id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<boolean> => {
  const exist = await User.countDocuments({_id: id} ).exec();
  if ( exist ) {
    return true;
  } else {
    ctx.success = false;
    ErrorHelper.notExistError(ctx, String(id), 'User');
    return false;
  }
};

/*
* return true if NOT exist
* return boolean
*/
userSchema.statics.checkEmailExist = async (email: String, ctx: Koa.Context) => {
  const exist = await User.countDocuments({email: email}).exec();
  if ( exist ) {
    ctx.success = false;
    ctx.errors.push({
      'param' : 'User email',
      'msg'   : 'This Email Already Exist'
    });
    return false;
  } else {
    return true;
  }
};

/*
* return true if NOT exist
* return boolean
*/
userSchema.statics.getUserCompanies = async (id: mongoose.Types.ObjectId, ctx: Koa.Context): Promise<any> => {

  const userCompanies     = await CompanyUser.find({userID: id }).exec();
  const userCompaniesIDs  = userCompanies.map( ( uCompany: any ) => {
    return uCompany.companyID;
  });
  const companies = await Company
    .find({ '_id': { $in: userCompaniesIDs }})
    .populate({ path: 'admins'})
    .exec();

  return await Promise.all(
    companies.map(async (company: any) => {
      const company_admins_ids =  await company.admins.map( ( userIn: any ) => {
        return userIn.userID;
      });
      let companyResponse   =  await company.prepareApi(false, ctx);
      companyResponse.role  = ( String(id) == String(company.ownerID) ) ? 'owner' : ( company_admins_ids.includes(String(id)) ) ? 'admin' : 'user';
      return companyResponse;
    })
  );

};

/*
*/
userSchema.statics.checkRights = async function (current_user_id: mongoose.Types.ObjectId, user_id: mongoose.Types.ObjectId, ctx: Koa.Context) {

  if ( current_user_id == user_id ) return true; // Current User

  const user = await User.findById(user_id).exec();

  // Company Owner where User create
  if ( !user.isIndependent ) {

    const companies = await this.getUserCompanies(user_id, ctx);

    const ownerExist = await companies.filter( (company: ICompanyDocument) => {
      return String(company.ownerID) == String(current_user_id);
    });
    return !!( ownerExist.length );
  }

  return false;

};

/*
*  ============================== Exports ==============================
*/

const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export {
  User,
  userSchema,
};
export default User;
