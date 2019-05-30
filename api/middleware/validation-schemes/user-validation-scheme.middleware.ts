import * as Koa from 'koa';
import { User } from '../../../common/models/User.model';
import { IUserDocument } from '../../../common/interfaces/user.interface';

// Helpers
import ErrorHelper from '../../../common/helpers/error.helper';

export const userPayloadValidateSchema = async(ctx: Koa.Context, next: Function) => {
  const scheme = {
    'user': {
      notEmpty: true,
      errorMessage: 'Request Body is empty'
    }
  };

  ctx.checkBody( scheme );

  const validateError = await ctx.validationErrors();
  if ( validateError.length > 0 ) {
    return ErrorHelper.validateError(ctx, next, validateError);
  } else {
    return next();
  }
};

export const userEmailValidateSchema = async(ctx: Koa.Context, next: Function) => {
  const scheme = {
    'user': {
      notEmpty: true,
      errorMessage: 'Request Body is empty'
    },
    'user.email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    }
  };

  ctx.checkBody( scheme );

  const validateError = await ctx.validationErrors();
  if ( validateError.length > 0 ) {
    return ErrorHelper.validateError(ctx, next, validateError);
  } else {
    return next();
  }
};

export const userValidateSchema = async(ctx: Koa.Context, next: Function) => {
  ctx.checkBody({
    'user.email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    },
    'user.password': {
      notEmpty: true,
      isLength: {
        options: [{ min: 6, max: 20}],
        errorMessage: 'Must be between 2 and 10 chars long'
      },
      errorMessage: 'Invalid Password'
    },
    'user.name': {
      optional: true,
      isLength: {
        options: [{ min: 3 }],
        errorMessage: 'Must be less 3 chars'
      },
      errorMessage: 'Invalid Name'
    }
  });

  const validateError = await ctx.validationErrors();
  if ( validateError.length > 0 ) {
    return ErrorHelper.validateError(ctx, next, validateError);
  }

  const existingUser = await User.findOne({ email: ctx.locals.user.email }, async (error, existingUser: IUserDocument) => {
    return existingUser;
  });

  if ( existingUser ) {
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    ctx.errors.push({
      'param' : 'user.email',
      'msg'   : 'User Already Exist',
      'value' : existingUser.prepareApi(false, ctx)
    });
  }
  return next();

};

export const loginValidateSchema = async(ctx: Koa.Context, next: Function) => {
  ctx.checkBody({
    'email': {
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    },
    'password': {
      notEmpty: true,
      isLength: {
        options: [{ min: 6, max: 20}],
        errorMessage: 'Must be between 2 and 10 chars long'
      },
      errorMessage: 'Invalid Password'
    }
  });

  const validateError = await ctx.validationErrors();
  if ( validateError.length > 0 ) {
    return ErrorHelper.validateError(ctx, next, validateError);
  }

  return next();

};

