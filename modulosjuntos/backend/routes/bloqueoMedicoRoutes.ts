import { Router } from 'express'
import { getBloqueosMedico, createBloqueoMedico, updateBloqueoMedico, deleteBloqueoMedico } from '../controllers/bloqueoMedicoController'

const router = Router()

router.get('/', getBloqueosMedico)
router.post('/', createBloqueoMedico)
router.put('/:id', updateBloqueoMedico)
router.delete('/:id', deleteBloqueoMedico)

export default router 