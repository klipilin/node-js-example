import * as bunyan from 'bunyan';

export const loggerHelper = bunyan.createLogger({
  name: process.env.APP_NAME || 'App Name',
  level: (process.env.LOG_LEVEL as bunyan.LogLevelString) || 'debug',
  serializers: bunyan.stdSerializers
});
