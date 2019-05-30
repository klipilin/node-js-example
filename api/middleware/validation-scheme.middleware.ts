import { userPayloadValidateSchema, userEmailValidateSchema, userValidateSchema, loginValidateSchema } from './validation-schemes/user-validation-scheme.middleware';
import { companyPayloadValidateSchema, companyValidateSchema, companyWithUserValidateSchema } from './validation-schemes/company-validation-scheme.middleware';

// User Validation
export const userValidate             = userValidateSchema;
export const loginUpValidate          = loginValidateSchema;
export const userEmailValidate        = userEmailValidateSchema;
export const userPayloadValidate      = userPayloadValidateSchema;

// Company Validation
export const companyPayloadValidate   =  companyPayloadValidateSchema;
export const companyValidate          =  companyValidateSchema;
export const companyWithUserValidate  =  companyWithUserValidateSchema;
