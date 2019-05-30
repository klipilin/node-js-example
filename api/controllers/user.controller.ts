import * as Koa     from 'koa';

// Interfaces

// Models
import { User }     from '../../common/models/User.model';

// Helpers
import ValidateHelper from '../../common/helpers/validate.helper';
import ErrorHelper    from '../../common/helpers/error.helper';
import MailHelper     from '../../common/helpers/mail.helper';

class UserController {

  /*
  * GET /user/:id
  */
  public getOneAction = async  (ctx: Koa.Context, next: Function) => {
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();
    const userID = ctx.params.id;

    if ( await User.checkIDExist(userID, ctx) ) {
      const check_user_rights = await User.checkRights(ctx.User._id, userID, ctx);
      if ( check_user_rights ) {
        ctx.success = true;
        ctx.body    = {
          user : await User.getFullInfo(userID, ctx)
        };
      } else {
        ErrorHelper.permissionError(ctx);
      }
    }

    return next();

  };

  /*
  * GET /user/:id/companies
  */
  public getUserCompaniesAction = async  (ctx: Koa.Context, next: Function) => {
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const userID = ctx.params.id;

    if ( await User.checkIDExist(userID, ctx) ) {
      const check_user_rights = await User.checkRights(ctx.User._id, userID, ctx);
      if ( check_user_rights ) {
        if ( await User.checkIDExist(userID, ctx) ) {
          ctx.success = true;
          ctx.body    = {
            companies : await User.getUserCompanies(userID, ctx)
          };
        }
      } else {
        ErrorHelper.permissionError(ctx);
      }
    }
    return next();
  };

  /*
  * POST /user/update/:id
  */
  public updateAction = async (ctx: Koa.Context, next: Function) => {
    if ( ctx.validationError ) return next();
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const userID            = ctx.params.id;

    if ( await User.checkIDExist(userID, ctx) ) {
      const check_user_rights = await User.checkRights(ctx.User._id, userID, ctx);

      if ( check_user_rights ) {
        const request = await User.prepareRequestParams( ctx.locals.user, ctx );

        const currentUser = await User.findById(userID).exec();
        await currentUser.set(request).save();

        ctx.success = true;
        ctx.body    = {
          user : await User.getFullInfo( userID, ctx )
        };
      } else {
        ErrorHelper.permissionError(ctx);
      }
    }

    return next();

  };

  /*
  * DELETE /user/delete/:id
  */
  public deleteAction = async  (ctx: Koa.Context, next: Function) => {
    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const userID            = ctx.params.id;
    const check_user_rights = await User.checkRights(ctx.User._id, userID, ctx);
    if ( check_user_rights ) {
      User.deleteOne({ _id: userID }, function (e) {
        if (e) console.log(e);
      });
      ctx.success = true;
    } else {
      ErrorHelper.permissionError(ctx);
    }
    return next();
  };

  /*
  * POST /user/reset-password/
  */
  public resetPasswordAction = async  (ctx: Koa.Context, next: Function) => {
    if ( ctx.validationError ) return next();

    const user = await User.findOne( {email: ctx.locals.user.email}).exec();
    if ( user ) {
      MailHelper.send(ctx.locals.user.email, 'Password Reset', await MailHelper.resetPasswordEmailText(ctx.locals.user.email), ctx );
      ctx.success = true;
    } else {
      ErrorHelper.permissionError(ctx);
    }
    return next();
  };

  /*
  * POST /user/:id/send-sign-up-email/
  */
  public sendSignUpEmail = async  (ctx: Koa.Context, next: Function) => {

    if ( !ValidateHelper.isValidParamID(ctx) ) return next();

    const userID            = ctx.params.id;

    if ( await User.checkIDExist(userID, ctx) ) {
      const user = await User.findOne( {_id: userID}).exec();
      const link = await MailHelper.generateJWTStringLink( { user: { _id: user._id, email: user.email }}, 'user/invite/' );
      MailHelper.send( user.email, 'Sign Up', await MailHelper.signUpEmailText(link), ctx );
      ctx.success = true;
    }

    return next();
  };


}

export default new UserController();
