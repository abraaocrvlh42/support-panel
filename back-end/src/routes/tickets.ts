import { Router } from 'express';
import { getAll, create, updateStatus } from '../controllers/ticketsController';

const router = Router();

router.get('/',              getAll);
router.post('/',             create);
router.patch('/:id/status',  updateStatus);

export default router;
