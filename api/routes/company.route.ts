import * as Router from 'koa-router';

// Controllers
import companyController from '../controllers/company.controller';

// MiddleWares
import { companyPayloadValidate, companyValidate, userPayloadValidate } from '../middleware/validation-scheme.middleware';

const companyRoute = new Router();

companyRoute
  .get('/:id', companyController.getOneAction)
  .get('/:id/users', companyController.getUsersAction)
  .get('/:id/admins', companyController.getAdminsAction)

  .post('/:id/add-user', userPayloadValidate, companyController.addCompanyUserAction)
  .post('/:id/remove-user', userPayloadValidate, companyController.removeCompanyUserAction)
  .post('/:id/set-user-role', userPayloadValidate, companyController.setCompanyUserRoleAction)

  .post('/create', companyValidate, companyController.createAction)
  .post('/update/:id', companyPayloadValidate, companyController.updateAction)
  .delete('/delete/:id', companyController.deleteAction);

export default companyRoute;
