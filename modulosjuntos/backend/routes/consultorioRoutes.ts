import { Router } from 'express';
import * as consultorioController from '../controllers/consultorioController';

const router = Router();

router.get('/', consultorioController.getAllConsultorios);
router.get('/:id', consultorioController.getConsultorioById);
router.post('/', consultorioController.createConsultorio);
router.put('/:id', consultorioController.updateConsultorio);
router.delete('/:id', consultorioController.deleteConsultorio);

export default router; 