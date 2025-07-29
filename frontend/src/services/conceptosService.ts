import axios from 'axios';

const API_URL = 'http://localhost:3002/api/servicios';

export interface Servicio {
  id: string;
  nombre: string;
  precio_base: number;
  descripcion?: string | null;
}

export async function getAllServicios(): Promise<Servicio[]> {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function createServicio(data: Omit<Servicio, 'id'>): Promise<Servicio> {
  const res = await axios.post(API_URL, data);
  return res.data;
}

export async function updateServicio(id: string, data: Omit<Servicio, 'id'>): Promise<Servicio> {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
}

export async function deleteServicio(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}

export async function getUsosDeServicio(id: string) {
  const res = await axios.get(`/api/servicios/${id}/usos`);
  return res.data;
} 