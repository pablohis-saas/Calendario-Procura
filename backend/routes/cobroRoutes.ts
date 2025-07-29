import { Router } from 'express';
import * as cobroController from '../controllers/cobroController';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/', cobroController.getAllCobros);
router.get('/:id', cobroController.getCobroById);

// Rutas protegidas (requieren JWT en el header Authorization)
router.post('/', cobroController.createCobro);
router.put('/:id', cobroController.updateCobro);
router.delete('/:id', cobroController.deleteCobro);

// Rutas para agregar servicios y conceptos al cobro
router.post('/:id/servicio', cobroController.addServicioToCobro);
router.post('/:id/concepto', cobroController.addConceptoToCobro);

export default router; 