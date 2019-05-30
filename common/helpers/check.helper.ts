import * as Koa       from 'koa';
const mongodb   = require('mongodb');

class CheckHelper {

  /**
   */
  public needEncrypt = ( ctx: Koa.Context ): boolean => {
    if ( !Number(process.env.API_ENCRYPTION_ENABLED) || !Number(process.env.API_BODY_JWT_ENABLED) ) {
      return false;
    } else {
      // Skip GET,HEAD,DELETE
      const skipMethods = process.env.API_SKIP_ENCRYPTION_ENCODING_FOR_METHODS.split(',');
      return !(skipMethods.indexOf(ctx.request.method) !== -1);
    }
  };

  /**
   */
  public needEncode = ( ctx: Koa.Context ): boolean => {
    if ( !Number(process.env.API_BODY_JWT_ENABLED ) ) {
      return false;
    } else {
      // Skip GET,HEAD,DELETE
      const skipMethods = process.env.API_SKIP_ENCRYPTION_ENCODING_FOR_METHODS.split(',');
      return !(skipMethods.indexOf(ctx.request.method) !== -1);
    }
  };

  /**
   */
  public isMongoObjectID = ( value: any ): boolean => {
    return mongodb.ObjectID.isValid(value);
  };




}

export default new CheckHelper;
