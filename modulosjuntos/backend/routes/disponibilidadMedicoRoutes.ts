import { Router } from 'express'
import { getDisponibilidadesMedico, createDisponibilidadMedico, updateDisponibilidadMedico, deleteDisponibilidadMedico } from '../controllers/disponibilidadMedicoController'

const router = Router()

router.get('/', getDisponibilidadesMedico)
router.post('/', createDisponibilidadMedico)
router.put('/:id', updateDisponibilidadMedico)
router.delete('/:id', deleteDisponibilidadMedico)

export default router 