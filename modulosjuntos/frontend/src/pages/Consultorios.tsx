import React, { useEffect, useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import axios from 'axios';

interface Consultorio {
  id: string;
  nombre: string;
  direccion: string;
}

export default function Consultorios() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConsultorios();
  }, []);

  async function fetchConsultorios() {
    setLoading(true);
    try {
      const res = await axios.get('/api/consultorios');
      setConsultorios(res.data);
    } catch {
      alert('Error al cargar consultorios');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !direccion) return alert('Completa todos los campos');
    setLoading(true);
    try {
      await axios.post('/api/consultorios', { nombre, direccion });
      setNombre('');
      setDireccion('');
      fetchConsultorios();
      alert('Consultorio agregado');
    } catch {
      alert('Error al agregar consultorio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Consultorios</h1>
      <Card className="mb-6 p-4">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={direccion} onChange={e => setDireccion(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>Agregar</Button>
        </form>
      </Card>
      <Card className="p-4">
        <h2 className="font-semibold mb-2">Lista de consultorios</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-1">Nombre</th>
              <th className="py-1">Dirección</th>
            </tr>
          </thead>
          <tbody>
            {consultorios.map(c => (
              <tr key={c.id}>
                <td className="py-1">{c.nombre}</td>
                <td className="py-1">{c.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
} 