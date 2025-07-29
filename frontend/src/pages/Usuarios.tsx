import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getUsuarios, crearUsuario } from "@/services/usuariosService";
import Consultorios from './Consultorios';
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
            <button
              className="bg-[#4285f2] text-white h-14 px-10 rounded-xl shadow-lg hover:bg-[#4285f2]/90 transition text-2xl font-bold"
            >
              Agregar Usuario
            </button>
          </DialogTrigger>
        </Dialog>
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#4285f2]">Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 mt-6">
            <div>
              <label className="block text-lg font-medium mb-2">Rol *</label>
              <Combobox value={selectedRol} onChange={value => { setSelectedRol(value); setValue('rol', value.value); }}>
                <div className="relative">
                  <Combobox.Button className="w-full h-12 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white flex items-center">
                    <span>{selectedRol.label}</span>
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {roles.map((rol) => (
                      <Combobox.Option
                        key={rol.value}
                        value={rol}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 px-4 text-lg ${active ? 'bg-blue-100' : ''} text-gray-900`
                        }
                      >
                        {rol.label}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
              {errors.rol && (
                <p className="text-red-500 text-base mt-1">{errors.rol.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Nombre *</label>
              <Input
                {...register("nombre")}
                placeholder="Nombre del usuario"
                className="h-12 px-4 text-lg"
              />
              {errors.nombre && (
                <p className="text-red-500 text-base mt-1">{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Apellido *</label>
              <Input
                {...register("apellido")}
                placeholder="Apellido del usuario"
                className="h-12 px-4 text-lg"
              />
              {errors.apellido && (
                <p className="text-red-500 text-base mt-1">{errors.apellido.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Email *</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="email@ejemplo.com"
                className="h-12 px-4 text-lg"
              />
              {errors.email && (
                <p className="text-red-500 text-base mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Teléfono *</label>
              <Input
                {...register("telefono")}
                placeholder="Teléfono del usuario"
                className="h-12 px-4 text-lg"
              />
              <label className="block text-lg font-medium mb-2">Consultorio *</label>
              <Combobox
                value={consultorios.find(c => c.id === watch('consultorio_id')) || null}
                onChange={value => setValue('consultorio_id', value.id)}
              >
                <div className="relative">
                  <Combobox.Button className="w-full h-12 px-4 text-lg border border-gray-400 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center">
                    <span className="text-gray-900">
                      {consultorios.find(c => c.id === watch('consultorio_id'))?.nombre || 'Seleccionar consultorio'}
                    </span>
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-400 rounded-md shadow-lg max-h-60 overflow-auto">
                    {consultorios.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No hay consultorios</div>
                    )}
                    {consultorios.map((c) => (
                      <Combobox.Option
                        key={c.id}
                        value={c}
                        className={({ active }) =>
                          `cursor-pointer select-none py-2 px-4 text-lg ${active ? 'bg-blue-100' : ''} text-gray-900 bg-white`
                        }
                      >
                        <span className="text-gray-900">{c.nombre}</span>
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
              {errors.consultorio_id && (
                <p className="text-red-500 text-base mt-1">{errors.consultorio_id.message}</p>
              )}
            </div>
            {errorMsg && (
              <p className="text-red-500 text-base">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-green-500 text-base">{successMsg}</p>
            )}
            <div className="flex justify-end space-x-4 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 px-6 text-lg font-semibold rounded border border-gray-300 bg-white text-gray-900 shadow hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-6 text-lg font-semibold rounded bg-[#4285f2] text-white hover:bg-[#4285f2]/90 transition shadow"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-[#4285f2] mb-4">Consultorios</h2>
        <Consultorios />
      </div>
    </div>
  );
} 