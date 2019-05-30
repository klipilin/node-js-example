import * as Koa from 'koa';

// Helpers
import  ErrorHelper  from '../../../common/helpers/error.helper';

export const companyPayloadValidateSchema = async(ctx: Koa.Context, next: Function) => {
  const scheme = {
    'company': {
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

export const companyValidateSchema = async(ctx: Koa.Context, next: Function) => {
  const scheme = {
    'company.title': {
      notEmpty: true,
      isLength: {
        options: [{ min: 2, max: 30}],
        errorMessage: 'Must be between 2 and 30 chars long'
      },
      errorMessage: 'Invalid Company Name'
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

export const companyWithUserValidateSchema = async(ctx: Koa.Context, next: Function) => {
  const scheme = {
    'company.title': {
      notEmpty: true,
      isLength: {
        options: [{ min: 2, max: 30}],
        errorMessage: 'Must be between 2 and 30 chars long'
      },
      errorMessage: 'Invalid Company Name'
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
