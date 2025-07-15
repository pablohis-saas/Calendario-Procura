import { Router } from 'express';
import * as pacienteController from '../controllers/pacienteController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(pacienteController.getAllPacientes));
router.get('/search', asyncHandler(pacienteController.searchPacientes));
router.get('/:id', asyncHandler(pacienteController.getPacienteById));
router.post('/', asyncHandler(pacienteController.createPaciente));
router.put('/:id', asyncHandler(pacienteController.updatePaciente));
router.delete('/:id', asyncHandler(pacienteController.deletePaciente));

export default router; 