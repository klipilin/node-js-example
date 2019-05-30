const jwtSecret         = process.env.API_JWT_SECRET;
const jwt               = require('jsonwebtoken');

import CheckHelper      from '../../common/helpers/check.helper';
import ErrorHelper      from '../helpers/error.helper';

import * as Koa     from 'koa';

class PrepareRequestMiddleware {

  public setGlobalVariables = async (ctx: Koa.Context, next: Function) => {
    ctx.errors          = [];
    ctx.locals          = {};
    ctx.validationError = false;
    return next();
  };

  /*
  * @set Decrypt crypt aes-128-ctr ctx.request.body String  => String
  *
  * @param {String|String Encryption} ctx.request.body
  * @param {String} ctx.request.method
  *
  * @return {Function}
  */
  public decryptRequest = async (ctx: Koa.Context, next: Function) => {

    // there should be a code that decodes the information but it was deleted by Security Reason

    return next();

  };


  /*
  * @set JWT ctx.request.body => {}
  *
  * @param {String JWT} ctx.request.body
  * @param {String} ctx.request.method
  *
  * @return {Function}
  */
  public decodeRequest = async (ctx: Koa.Context, next: Function) => {

    // there should be a code that decodes the information but it was deleted by Security Reason

    return next();

  };

  /*
  * @set ctx.request.query || ctx.request.body => ctx.locals
  *
  * @param {Object} ctx.request.body
  * @param {Object} ctx.request.query
  *
  * @return {Function}
  */
  public setLocalsVariables = async (ctx: Koa.Context, next: Function) => {
    const skipMethods = process.env.API_SKIP_ENCRYPTION_ENCODING_FOR_METHODS.split(',');
    if ( skipMethods.indexOf(ctx.request.method) !== -1 ) {
      ctx.locals = ctx.request.query;
    } else {
      const body: any  = ctx.request.body;
      if ( typeof body === 'object' && Object.keys(body).length > 0) {
        if ( typeof body.data === 'object' && Object.keys(body).length > 0 ) {
          ctx.locals = body.data;
        } else {
          return ErrorHelper.dataValidateError(ctx, next,{ msg : 'Body.Data is empty', request : ctx.request.body });
        }
      } else {
        if ( body.length > 0 ) {
          let bodyJson: any;
          try {
            bodyJson = JSON.parse(body);
          } catch(e) {
            return ErrorHelper.dataValidateError(ctx, next,{ msg : 'JSON.parse Error', request : ctx.request.body });
          }
          if ( typeof bodyJson.data === 'object' && Object.keys(bodyJson.data).length > 0 ) {
            ctx.locals = bodyJson.data;
          } else {
            return ErrorHelper.dataValidateError(ctx, next,{ msg : 'Body.Data is empty', request : ctx.request.body });
          }
        } else {
          return ErrorHelper.dataValidateError(ctx, next,{ msg : 'Body is empty', request : ctx.request.body });
        }
      }
    }

    ctx.request.body  = ctx.locals;

    return next();
  }

}

module.exports = new PrepareRequestMiddleware();
