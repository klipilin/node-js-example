import * as Koa       from 'koa';
const mongodb   = require('mongodb');

class ValidateHelper {

  /**
   */
  public isValidParamID = ( ctx: Koa.Context ): boolean => {
    if ( !ctx.params || !ctx.params.id ) {
      ctx.status  = 400;
      ctx.success = false;
      ctx.errors.push({
        'param' : 'ID',
        'msg'   : 'ID is empty',
      });
      return false;
    } else {
      return mongodb.ObjectID.isValid(ctx.params.id);
    }
  };




}

export default new ValidateHelper;
