import * as Router from 'koa-router';

// Controllers
import userController from '../controllers/user.controller';

// MiddleWares
import { userEmailValidate, userPayloadValidate } from '../middleware/validation-scheme.middleware';

const userRoute = new Router();

userRoute
  .get('/:id', userController.getOneAction)
  .get('/:id/companies', userController.getUserCompaniesAction)
  .post('/update/:id', userPayloadValidate, userController.updateAction)
  .post('/reset-password', userEmailValidate, userController.resetPasswordAction)
  .get('/:id/send-sign-up-email', userController.sendSignUpEmail)
  .delete('/delete/:id', userController.deleteAction);

export default userRoute;
