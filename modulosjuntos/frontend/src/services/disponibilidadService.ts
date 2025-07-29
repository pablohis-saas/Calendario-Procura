import axios from 'axios'

const API_BASE_URL = '/api'
const DISPONIBILIDAD_URL = `${API_BASE_URL}/disponibilidad-medico`

export async function getDisponibilidades(usuario_id?: string) {
  const res = await axios.get(DISPONIBILIDAD_URL, { params: usuario_id ? { usuario_id } : {} })
  console.log('Respuesta cruda de Axios (disponibilidades):', res)
  return res.data
}

export async function crearDisponibilidad(data: {
  usuario_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}) {
  const res = await axios.post(DISPONIBILIDAD_URL, data)
  return res.data
}

export async function actualizarDisponibilidad(id: string, data: {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}) {
  const res = await axios.put(`${DISPONIBILIDAD_URL}/${id}`, data)
  return res.data
}

export async function eliminarDisponibilidad(id: string) {
  const res = await axios.delete(`${DISPONIBILIDAD_URL}/${id}`)
  return res.data
} 