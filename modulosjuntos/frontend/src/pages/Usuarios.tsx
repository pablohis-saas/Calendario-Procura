import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getUsuarios, crearUsuario } from "@/services/usuariosService";
import Consultorios from './Consultorios';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import { Combobox } from "@headlessui/react";
import axios from "axios";

const usuarioSchema = z.object({
  rol: z.string().min(1, "El rol es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  consultorio_id: z.string().min(1, "El consultorio es requerido"),
});

type UsuarioForm = z.infer<typeof usuarioSchema>;

const roles = [
  { value: "DOCTOR", label: "Doctor" },
  { value: "ENFERMERA", label: "Enfermera" },
  { value: "RECEPCION", label: "Recepción" },
];

export default function UsuariosYConsultorios() {
  console.log('🔍 Componente UsuariosYConsultorios renderizando...');
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [consultorios, setConsultorios] = useState<any[]>([]);
  const [selectedRol, setSelectedRol] = useState(roles[0]);
  const [selectedConsultorio, setSelectedConsultorio] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
  });

  useEffect(() => {
    loadUsuarios();
    fetchConsultorios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const fetchConsultorios = async () => {
    try {
      const res = await axios.get('/api/consultorios');
      setConsultorios(res.data);
    } catch {
      setConsultorios([]);
    }
  };

  const onSubmit = async (data: UsuarioForm) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await crearUsuario(data);
      setSuccessMsg("Usuario registrado correctamente");
      setOpen(false);
      reset();
      await loadUsuarios();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || "Error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const getRolLabel = (rol: string) => {
    const roleObj = roles.find(r => r.value === rol);
    return roleObj ? roleObj.label : rol;
  };

  return (
    <div className="w-full max-w-[1600px] pt-10">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold text-[#4285f2]">Gestión de Usuarios y Consultorios</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#4285f2] hover:bg-[#3367d6] text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
        >
          Agregar Usuario
        </Button>
      </div>

      {/* Mensajes de éxito y error */}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultorio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usuario.nombre} {usuario.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRolLabel(usuario.rol)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.consultorio?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Editar
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar usuario */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                {...register("rol")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.rol && (
                <p className="text-red-500 text-sm mt-1">{errors.rol.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <Input
                {...register("nombre")}
                placeholder="Nombre"
                className="w-full"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <Input
                {...register("apellido")}
                placeholder="Apellido"
                className="w-full"
              />
              {errors.apellido && (
                <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                {...register("telefono")}
                placeholder="Teléfono"
                className="w-full"
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultorio
              </label>
              <select
                {...register("consultorio_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar consultorio</option>
                {consultorios.map((consultorio) => (
                  <option key={consultorio.id} value={consultorio.id}>
                    {consultorio.nombre}
                  </option>
                ))}
              </select>
              {errors.consultorio_id && (
                <p className="text-red-500 text-sm mt-1">{errors.consultorio_id.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sección de consultorios */}
      <div className="mt-16">
        <Consultorios />
      </div>

      {/* Sección de sincronización con Google Calendar */}
      <div className="mt-16">
        <GoogleCalendarSync />
      </div>
    </div>
  );
} 