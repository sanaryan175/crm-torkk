import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { validate } from '../middleware/validate';
import { createBranchSchema, updateBranchSchema, branchQuerySchema } from '../validations/branch.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',       requirePermission('subscription.manage'), validate(branchQuerySchema), BranchController.listBranches);
router.post('/',      requirePermission('subscription.manage'), validate(createBranchSchema), BranchController.createBranch);
router.get('/:id',    requirePermission('subscription.manage'), BranchController.getBranchById);
router.put('/:id',    requirePermission('subscription.manage'), validate(updateBranchSchema), BranchController.updateBranch);
router.delete('/:id', requirePermission('subscription.manage'), BranchController.deleteBranch);

export default router;
