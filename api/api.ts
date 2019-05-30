require('dotenv').config();

import * as Koa     from 'koa';
import * as koaBody from 'koa-body';
import * as cors    from '@koa/cors';
const mongodb   = require('mongodb');

import { loggerHelper } from '../common/helpers/logger.helper';
import  MongooseHelper  from '../common/helpers/mongoose.helper';

import apiRouter        from './routes';

const prepareRequest    = require('../common/middleware/prepareRequest.middleware');
const prepareResponse   = require('../common/middleware/prepareResponse.middleware');
const serve             = require('koa-static');
const koaBunyanLogger   = require('koa-bunyan-logger');
const bodyParser        = require('koa-bodyparser');
const convert           = require('koa-convert');

class ApiClass {

  public app: Koa;

  constructor() {
    this.app = new Koa();
    this.config();

    MongooseHelper.connect();

  }

  static getPort(): number {
    return Number( process.env.API_SERVER_PORT ) || 4000;
  }

  private config(): void {

    this.app.use(koaBody());

    this.app.use(cors());
    this.app.use(koaBunyanLogger(loggerHelper));
    this.app.use(koaBunyanLogger.requestLogger());
    this.app.use(koaBunyanLogger.timeContext());
    this.app.use(serve('public'));

    const koaValidator  = require('koa-async-validator');
    this.app.use(convert(bodyParser()));

    this.app.use(prepareRequest.setGlobalVariables);
    this.app.use(prepareRequest.decryptRequest);
    this.app.use(prepareRequest.decodeRequest);
    this.app.use(prepareRequest.setLocalsVariables);

    this.app.use(koaValidator({
      customValidators: {
        isMongoID: function(value: String) {
          return mongodb.ObjectID.isValid(value);
        }
      }
    }));

    this.app.use(apiRouter.routes());
    this.app.use(apiRouter.allowedMethods({
      throw: false
    }));

    this.app.use(prepareResponse.setResponseData);
    this.app.use(prepareResponse.encodeResponse);
    this.app.use(prepareResponse.encryptResponse);

  }
}

const apiServer = new ApiClass();

apiServer.app.listen(
  ApiClass.getPort(),
  () => {
    console.log(`API running on port ${ApiClass.getPort()}`);
  }
);
