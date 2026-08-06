import { Router } from 'express';
import { OfferLetterController } from '../controllers/offerletter.controller';
import { validate } from '../middleware/validate';
import { createOfferLetterSchema, updateOfferLetterSchema, updateOfferLetterStatusSchema } from '../validations/offerletter.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',          requirePermission('hr.read'),       OfferLetterController.getOfferLetters);
router.post('/',         requirePermission('hr.create'),     validate(createOfferLetterSchema),      OfferLetterController.createOfferLetter);
router.get('/:id',       requirePermission('hr.read'),       OfferLetterController.getOfferLetterById);
router.put('/:id',       requirePermission('hr.update'),     validate(updateOfferLetterSchema),      OfferLetterController.updateOfferLetter);
router.put('/:id/status',requirePermission('hr.update'),     validate(updateOfferLetterStatusSchema), OfferLetterController.updateOfferLetterStatus);
router.delete('/:id',    requirePermission('hr.delete'),     OfferLetterController.deleteOfferLetter);

export default router;
