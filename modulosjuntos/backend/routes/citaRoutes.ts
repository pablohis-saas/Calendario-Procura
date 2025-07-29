import { Router } from 'express';
import * as citaController from '../controllers/citaController';

const router = Router();

router.get('/', citaController.getAllCitas);
router.post('/', citaController.createCita);
router.delete('/:id', citaController.deleteCita);
router.put('/:id', citaController.updateCita);

export default router; 