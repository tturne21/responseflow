import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/customers.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/',    authenticate, authorize('manager', 'admin'), getAll);
router.get('/:id', authenticate, getOne);
router.post('/',   authenticate, authorize('manager', 'admin'), create);
router.put('/:id', authenticate, authorize('manager', 'admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

export default router;
