import axios from 'axios';

const API_BASE_URL = '/api';
const PACIENTES_URL = `${API_BASE_URL}/pacientes`;

export async function getPacientes() {
  const res = await axios.get(PACIENTES_URL);
  return res.data;
}

export async function crearPaciente(paciente: {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
}) {
  const res = await axios.post(PACIENTES_URL, paciente);
  return res.data;
}

export async function actualizarPaciente(id: string, paciente: {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
}) {
  const res = await axios.put(`${PACIENTES_URL}/${id}`, paciente);
  return res.data;
}

export async function eliminarPaciente(id: string) {
  const res = await axios.delete(`${PACIENTES_URL}/${id}`);
  return res.data;
}

export async function borrarPaciente(id: string) {
  const res = await axios.delete(`${PACIENTES_URL}/${id}`);
  return res.data;
} 