import * as Router        from 'koa-router';
import userRoute          from './routes/user.route';
import companyRoute       from './routes/company.route';

const apiRouter     = new Router();

apiRouter
  .get('/', async (ctx: any) => {ctx.response.body = {success : true, message : 'API Work'}; })
  .use('/user', userRoute.routes())
  .use('/company', companyRoute.routes());

export default apiRouter;
