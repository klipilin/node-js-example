import * as Koa     from 'koa';

class PrepareResponseMiddleware {

  /*
  * @set ctx.body.data
  *
  * @param {Object} ctx.body
  *
  * @return {Function}
  */
  public setResponseData = async (ctx: Koa.Context, next: Function) => {
    const body      = ctx.body    || null;
    const success   = ctx.success || false;
    const errors    = ctx.errors  || [];

    if ( !body && !success && !errors.length) {
      ctx.status = 404;
    }

    ctx.body  = {
      success : success,
      data    : body,
      errors  : errors
    };

    next();
  };

  /*
  * @set ctx.request.body => JWT String
  *
  * @param {Object} ctx.request.body
  *
  * @return {Function}
  */
  public encodeResponse = async (ctx: Koa.Context, next: Function) => {

    // there should be a code that encodes the information but it was deleted by Security Reason

    return next();

  };


  /*
  * @set JWT String ctx.request.body => String Encrypt aes-128-ctr
  *
  * @param {JWT String} ctx.request.body
  *
  * @return {Function}
  */
  public encryptResponse = async (ctx: Koa.Context, next: Function) => {

    // there should be a code that encrypt the information but it was deleted by Security Reason

    next();
  };

}

module.exports = new PrepareResponseMiddleware();
