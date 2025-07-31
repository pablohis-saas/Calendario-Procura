import { Router } from 'express';
import {
  getAllOrganizaciones,
  getOrganizacionById,
  createOrganizacion,
  updateOrganizacion,
  deleteOrganizacion,
  getOrganizacionStats
} from '../controllers/organizacionController';

const router = Router();

router.get('/', getAllOrganizaciones);
router.get('/:id', getOrganizacionById);
router.post('/', createOrganizacion);
router.put('/:id', updateOrganizacion);
router.delete('/:id', deleteOrganizacion);
router.get('/:id/stats', getOrganizacionStats);

export default router; 