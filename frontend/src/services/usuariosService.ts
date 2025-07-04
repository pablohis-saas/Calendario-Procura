import axios from 'axios';

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