import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validate } from '../middleware/validate';
import { createDocumentSchema, updateDocumentSchema } from '../validations/document.validation';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/',           requirePermission('document.read'),   DocumentController.getDocuments);
router.post('/',          requirePermission('document.create'), validate(createDocumentSchema), DocumentController.createDocument);
router.get('/:id',        requirePermission('document.read'),   DocumentController.getDocumentById);
router.put('/:id',        requirePermission('document.update'), validate(updateDocumentSchema), DocumentController.updateDocument);
router.get('/:id/versions', requirePermission('document.read'), DocumentController.getDocumentVersions);
router.delete('/:id',     requirePermission('document.delete'), DocumentController.deleteDocument);

export default router;
