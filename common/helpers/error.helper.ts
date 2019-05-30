import * as Koa from 'koa';

class ErrorHelper {

  /**
   */
  public validateError  = async ( ctx: Koa.Context, next: Function , errors: [] ) =>  {
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    if ( !("errors" in ctx) ) ctx.errors = [];
    errors.forEach( (error: {}) => {
      ctx.errors.push(error);
    });
    return next();
  };

  /**
   */
  public dataValidateError  = async ( ctx: Koa.Context, next: Function , error: any ) =>  {
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    if ( !("errors" in ctx) ) ctx.errors = [];
    ctx.errors.push(error);
    return next();
  };

  /**
   */
  public permissionError = async ( ctx: Koa.Context ) => {
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    if ( !("errors" in ctx) ) ctx.errors = [];
    ctx.errors.push({
      'msg'   : 'Permission Denied',
    });
  };

  /**
   */
  public notExistError = async ( ctx: Koa.Context, id: string, modelName: string  ) => {
    const error = {
      'msg'   : id + ' does not exist in ' + modelName + ' Model',
    };
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    if ( !("errors" in ctx) ) ctx.errors = [];
    ctx.errors.push(error);
  };

  /**
   */
  public customError = async ( ctx: Koa.Context, error: any  ) => {
    ctx.validationError = true;
    ctx.success         = false;
    ctx.data            = {};
    if ( !("errors" in ctx) ) ctx.errors = [];
    ctx.errors.push(error);
  };


}

export default new ErrorHelper;

