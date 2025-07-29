import axios from 'axios';

// Interceptor global para manejar expiración de sesión o token inválido
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

const COBROS_URL = '/api/cobros';
const CONCEPTOS_URL = '/api/cobro-conceptos';
const PACIENTES_URL = '/api/pacientes';
const USUARIOS_URL = '/api/usuarios';
const CONSULTORIOS_URL = '/api/consultorios';

export async function crearCobro(data: any) {
  const token = localStorage.getItem('token');
  const res = await axios.post(COBROS_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function agregarConceptoACobro(data: any) {
  const res = await axios.post(CONCEPTOS_URL, data);
  return res.data;
}

export async function getPacientes() {
  const res = await axios.get(PACIENTES_URL);
  return res.data;
}

export async function getUsuarios() {
  const res = await axios.get(USUARIOS_URL);
  return res.data;
}

export async function getConsultorios() {
  const res = await axios.get(CONSULTORIOS_URL);
  return res.data;
}

export async function getCobros() {
  const res = await axios.get(COBROS_URL);
  return res.data;
}

export async function eliminarCobro(id: string) {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${COBROS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarCobro(id: string, data: any) {
  const token = localStorage.getItem('token');
  const res = await axios.put(`${COBROS_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 