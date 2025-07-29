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

const API_BASE_URL = '/api';
const USUARIOS_URL = `${API_BASE_URL}/usuarios`;

export async function getUsuarios() {
  const res = await axios.get(USUARIOS_URL);
  return res.data;
}

export async function crearUsuario(usuario: {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  consultorio_id: string;
}) {
  const res = await axios.post(USUARIOS_URL, usuario);
  return res.data;
}

export async function actualizarUsuario(id: string, usuario: {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  consultorio_id: string;
}) {
  const res = await axios.put(`${USUARIOS_URL}/${id}`, usuario);
  return res.data;
}

export async function eliminarUsuario(id: string) {
  const res = await axios.delete(`${USUARIOS_URL}/${id}`);
  return res.data;
} 