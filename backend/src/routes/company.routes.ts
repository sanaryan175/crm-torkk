import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { validate } from '../middleware/validate';
import { createCompanySchema, updateCompanySchema } from '../validations/company.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',      requirePermission('company.read'),   CompanyController.getCompanies);
router.post('/',     requirePermission('company.create'), validate(createCompanySchema),  CompanyController.createCompany);
router.get('/:id',   requirePermission('company.read'),   CompanyController.getCompanyById);
router.put('/:id',   requirePermission('company.update'), validate(updateCompanySchema),  CompanyController.updateCompany);
router.delete('/:id',requirePermission('company.delete'), CompanyController.deleteCompany);

export default router;
