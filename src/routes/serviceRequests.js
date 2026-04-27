import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/serviceRequests.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/',    authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/',   authenticate, authorize('manager', 'admin'), create);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, authorize('manager', 'admin'), remove);

export default router;
