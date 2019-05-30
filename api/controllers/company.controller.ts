import * as Koa       from 'koa';

// Interfaces
import { ICompanyUserDocument } from '../../common/interfaces/company-user.interface';

// Models
import { Company }      from '../../common/models/Company.model';
import { CompanyUser }  from '../../common/models/CompanyUser.model';
import { User }         from '../../common/models/User.model';

// MiddleWare

// Helpers
import ValidateHelper from '../../common/helpers/validate.helper';
import ErrorHelper    from '../../common/helpers/error.helper';

class CompanyController {

  /*
  * POST /company/:id
  */
  public getOneAction = async (ctx: Koa.Context, next: Function) => {

    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_user_rights = Company.checkRights(ctx.User._id, companyID, ctx);

    if ( check_user_rights ) {
      ctx.success = true;
      ctx.body    = {
        company : await Company.getFullInfo(companyID, ctx)
      };
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };


  /*
 * GET /company/:id/users
 */
  public  getUsersAction = async (ctx: Koa.Context, next: Function) => {

    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_user_rights = Company.checkRights(ctx.User._id, companyID, ctx);

    if ( check_user_rights ) {
      const users = await Company.getCompanyUsers( companyID, ctx );
      ctx.success = true;
      ctx.body    = {
        users : users
      };
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
 * GET /company/:id/users
 */
  public  getAdminsAction = async (ctx: Koa.Context, next: Function) => {

    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_user_rights = Company.checkRights(ctx.User._id, companyID, ctx);

    if ( check_user_rights ) {
      const users = await Company.getCompanyAdmins( companyID, ctx );
      ctx.success = true;
      ctx.body    = {
        users : users
      };
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
  * POST /company/create
  */
  public createAction = async (ctx: Koa.Context, next: Function) => {

    if ( ctx.validationError ) return next();

    const companyRequest      = ctx.locals.company;
    const check_user          = await User.checkIDExist(ctx.User._id, ctx);
    const can_create_company  = await Company.checkCanCreate(ctx.User._id, ctx);

    if ( check_user && can_create_company ) {
      const company = await Company.create({
        title: companyRequest.title,
        image: ( companyRequest.hasOwnProperty('image') ) ? companyRequest.image : null,
        ownerID: ctx.User._id,
      });

      await CompanyUser.create({
        userID: company.ownerID,
        companyID : company._id,
        role: 'owner'
      });

      ctx.success = true;
      ctx.body    = {
        company: await Company.getFullInfo(company._id, ctx)
      };

    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };


  /*
  * POST /company/update/:id
  */
  public updateAction = async (ctx: Koa.Context, next: Function) => {

    if ( ctx.validationError ) return next();
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_can_edit  = Company.checkCanEdit(ctx.User._id, companyID, ctx);

    if ( check_can_edit ) {
      const request = await Company.prepareRequestParams( ctx.locals.company, ctx );

      const currentCompany = await Company.findById(companyID).exec();
      await currentCompany.set(request).save();

      ctx.success = true;
      ctx.body    = {
        company : await Company.getFullInfo(companyID, ctx)
      };

    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
  * POST /company/delete/:id
  */
  public deleteAction = async (ctx: Koa.Context, next: Function) => {

    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_can_edit  = Company.checkCanEdit(ctx.User._id, companyID, ctx);

    if ( check_can_edit ) {
      const company = await Company.findById(companyID).exec();
            company.remove();
      ctx.success = true;
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
  * POST /company/:id/add-user
  */
  public addCompanyUserAction = async (ctx: Koa.Context, next: Function) => {
     if ( ctx.validationError ) return next();
     if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    if ( ctx.locals.role == undefined ) {
      await ErrorHelper.customError(ctx, { msg: 'param "role" is Required'});
      return next();
    }

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_can_edit  = await Company.checkCanEdit(ctx.User._id, companyID, ctx);

    if ( check_can_edit ) {
      const exist = await User.checkIDExist( ctx.locals.user._id, ctx );
      if ( exist ) {

        const existCompanyUser = await CompanyUser
          .countDocuments({
            userID: ctx.locals.user._id,
            companyID : companyID
          })
          .exec();

        if ( !existCompanyUser ) {
           CompanyUser.create({
             userID: ctx.locals.user._id,
             companyID : companyID ,
             role: ctx.locals.role
           });
        }

        ctx.success = true;
        ctx.body = {};
      }
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
  * POST /company/:id/remove-user
  */
  public removeCompanyUserAction = async (ctx: Koa.Context, next: Function) => {
    if ( ctx.validationError ) return next();
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_can_edit  = Company.checkCanEdit(ctx.User._id, companyID, ctx);

    if ( check_can_edit ) {
      const company_user = await CompanyUser.findOne( { userID: ctx.locals.user._id, companyID : companyID } ).exec();
      if ( company_user ) {
        company_user.remove();
      }

      ctx.success = true;
      ctx.body    = {};
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

  /*
  * POST /company/:id/set-user-role
  */
  public setCompanyUserRoleAction = async (ctx: Koa.Context, next: Function) => {
    if ( ctx.validationError ) return next();
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    if ( ctx.locals.role == undefined ) {
      await ErrorHelper.customError(ctx, { msg: 'param "role" is Required'});
      return next();
    }

    const companyID = ctx.params.id;
    if ( !(await Company.checkIDExist(companyID, ctx)) ) return next();

    const check_can_edit  = await Company.checkCanEdit(ctx.User._id, companyID, ctx);

    if ( check_can_edit ) {
      const exist = await User.checkIDExist( ctx.locals.user._id, ctx);
      if ( exist ) {
       await CompanyUser
          .updateOne(
            { userID: ctx.locals.user._id, companyID : companyID },
            { role: ctx.locals.role },
            ( error: Error, company_user: ICompanyUserDocument ) => {
              if ( error ) {
                return  ErrorHelper.customError( ctx, error );
              } else {
                ctx.success = true;
                ctx.body    = {};
              }
            }
          );
      }
    } else {
      ErrorHelper.permissionError(ctx);
    }

    return next();

  };

}

export default new CompanyController();
