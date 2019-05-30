require('dotenv').config();

import * as Koa     from 'koa';
import * as koaBody from 'koa-body';
import * as cors    from '@koa/cors';

import adminRouter    from './api/routes';

const serve             = require('koa-static');
const koaBunyanLogger   = require('koa-bunyan-logger');

import { loggerHelper } from './common/helpers/logger.helper';

class AdminClass {

  public app: Koa;

  constructor() {
    this.app = new Koa();
    this.config();
    this.connectDB();
  }
  private connectDB(): void {
    /**
     * Connect to MongoDB.
     */
    const mongoose    = require('mongoose');
    mongoose.Promise  = Promise;
    mongoose.set('debug', (process.env.COMMON_MONGODB_DEBUG_MODE == 'true'));
    mongoose.connect(process.env.COMMON_MONGODB_URI)
      .catch((err: any) => {
        console.error( err );
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
        process.exit();
      });
  }

  static getPort(): number {
    return Number( process.env.ADMIN_SERVER_PORT ) || 5000;
  }

  private config(): void {
    this.app.use(koaBody());
    const koaValidator  = require('koa-async-validator');
    this.app.use(koaValidator());
    this.app.use(cors());
    this.app.use(koaBunyanLogger(loggerHelper));
    this.app.use(koaBunyanLogger.requestLogger());
    this.app.use(koaBunyanLogger.timeContext());
    this.app.use(serve('public'));
    this.app.use(adminRouter.routes());
  }
}

const apiServer = new AdminClass();

apiServer.app.listen(
  AdminClass.getPort(),
  () => {
    console.log(`API running on port ${AdminClass.getPort()}`);
  }
);
