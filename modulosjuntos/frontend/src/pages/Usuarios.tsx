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
      const res = await fetch('/api/consultorios');
      const data = await res.json();
      setConsultorios(data);
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4285f2] hover:bg-[#3367d6] text-white">
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <Input
                    {...register("nombre")}
                    placeholder="Nombre"
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <Input
                    {...register("apellido")}
                    placeholder="Apellido"
                    className={errors.apellido ? "border-red-500" : ""}
                  />
                  {errors.apellido && (
                    <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="email@ejemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  {...register("telefono")}
                  placeholder="Teléfono"
                  className={errors.telefono ? "border-red-500" : ""}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  {...register("rol")}
                  className={`w-full p-2 border rounded-md ${
                    errors.rol ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.rol && (
                  <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultorio
                </label>
                <select
                  {...register("consultorio_id")}
                  className={`w-full p-2 border rounded-md ${
                    errors.consultorio_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Seleccionar consultorio</option>
                  {consultorios.map((consultorio) => (
                    <option key={consultorio.id} value={consultorio.id}>
                      {consultorio.nombre}
                    </option>
                  ))}
                </select>
                {errors.consultorio_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.consultorio_id.message}</p>
                )}
              </div>

              {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {successMsg}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4285f2] hover:bg-[#3367d6] text-white"
                >
                  {loading ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Google Calendar Sync Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sincronización con Google Calendar</h2>
        <GoogleCalendarSync />
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto mt-12 mb-16">
        <h2 className="text-2xl font-bold text-[#4285f2] mb-4">Usuarios</h2>
        <table className="min-w-full border text-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-8 py-5 text-gray-700 text-lg">ID</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Rol</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Nombre</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Apellido</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Email</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Teléfono</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Consultorio</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition">
                <td className="border px-8 py-5 text-gray-900 text-lg">{usuario.id}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{getRolLabel(usuario.rol)}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{usuario.nombre}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{usuario.apellido}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{usuario.email}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{usuario.telefono}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{consultorios.find(c => c.id === usuario.consultorio_id)?.nombre || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-[#4285f2] mb-4">Consultorios</h2>
        <Consultorios />
      </div>
    </div>
  );
} 