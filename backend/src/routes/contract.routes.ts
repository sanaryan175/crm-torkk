import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { validate } from '../middleware/validate';
import { createContractSchema, updateContractSchema, signContractSchema } from '../validations/contract.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('contract.read'),   ContractController.getContracts);
router.post('/',      requirePermission('contract.create'), validate(createContractSchema), ContractController.createContract);
router.get('/:id',   requirePermission('contract.read'),   ContractController.getContractById);
router.put('/:id',   requirePermission('contract.update'), validate(updateContractSchema), ContractController.updateContract);
router.put('/:id/sign', requirePermission('contract.update'), validate(signContractSchema), ContractController.signContract);
router.delete('/:id', requirePermission('contract.delete'), ContractController.deleteContract);

export default router;
