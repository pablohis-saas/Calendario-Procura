import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPacientes, crearPaciente, actualizarPaciente, borrarPaciente } from "@/services/pacientesService";

const pacienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  genero: z.string().min(1, "El género es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
});

type PacienteForm = z.infer<typeof pacienteSchema>;

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editPaciente, setEditPaciente] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
  });

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    }
  };

  const onSubmit = async (data: PacienteForm) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Formatear la fecha de nacimiento si existe
    let pacienteData = { ...data };
    if (pacienteData.fecha_nacimiento) {
      // Si ya viene en formato yyyy-mm-dd, lo dejamos igual
      // Si viene en otro formato, aquí podrías agregar lógica para convertirlo
      // El input type="date" ya lo da en yyyy-mm-dd
      pacienteData.fecha_nacimiento = pacienteData.fecha_nacimiento;
    }

    try {
      await crearPaciente(pacienteData);
      setSuccessMsg("Paciente registrado correctamente");
      setOpen(false);
      reset();
      await loadPacientes();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || "Error al registrar el paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await borrarPaciente(deleteId);
      setDeleteId(null);
      await loadPacientes();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || "Error al borrar el paciente");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditOpen = (paciente: any) => {
    setEditPaciente({ ...paciente, fecha_nacimiento: paciente.fecha_nacimiento?.slice(0, 10) });
    setOpen(false);
  };

  const handleEditSubmit = async (data: PacienteForm) => {
    if (!editPaciente) return;
    setEditLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await actualizarPaciente(editPaciente.id, data);
      setEditPaciente(null);
      setSuccessMsg("Paciente actualizado correctamente");
      await loadPacientes();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || "Error al actualizar el paciente");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] pt-10">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold text-[#4285f2]">Gestión de Pacientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="bg-[#4285f2] text-white h-14 px-10 rounded-xl shadow-lg hover:bg-[#4285f2]/90 transition text-2xl font-bold"
            >
              Nuevo paciente
            </button>
          </DialogTrigger>
        </Dialog>
      </div>
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto mt-12">
        <table className="min-w-full border text-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-8 py-5 text-gray-700 text-lg">ID</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Nombre</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Apellido</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Email</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Teléfono</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Fecha Nacimiento</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id} className="hover:bg-gray-50 transition">
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.id}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.nombre}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.apellido}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.email || "-"}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.telefono || "-"}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">{paciente.fecha_nacimiento?.slice(0,10) || "-"}</td>
                <td className="border px-8 py-5 text-gray-900 text-lg">
                  <button
                    className="bg-[#4285f2] hover:bg-[#4285f2]/90 text-white font-bold py-2 px-4 rounded-lg mr-2 text-lg shadow"
                    onClick={() => handleEditOpen(paciente)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-lg shadow"
                    onClick={() => setDeleteId(paciente.id)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#4285f2]">Nuevo Paciente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 mt-6">
            <div>
              <label className="block text-lg font-medium mb-2">Nombre *</label>
              <Input
                {...register("nombre")}
                placeholder="Nombre del paciente"
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
                placeholder="Apellido del paciente"
                className="h-12 px-4 text-lg"
              />
              {errors.apellido && (
                <p className="text-red-500 text-base mt-1">{errors.apellido.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Género *</label>
              <select
                {...register("genero")}
                className="h-12 px-4 text-lg border rounded w-full text-gray-900 bg-white"
                defaultValue=""
              >
                <option value="" disabled>Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && (
                <p className="text-red-500 text-base mt-1">{errors.genero.message}</p>
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
                placeholder="+1234567890"
                className="h-12 px-4 text-lg"
              />
              {errors.telefono && (
                <p className="text-red-500 text-base mt-1">{errors.telefono.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Fecha de Nacimiento *</label>
              <Input
                {...register("fecha_nacimiento")}
                type="date"
                className="h-12 px-4 text-lg"
              />
              {errors.fecha_nacimiento && (
                <p className="text-red-500 text-base mt-1">{errors.fecha_nacimiento.message}</p>
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
                className="h-12 px-6 text-lg font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 transition text-gray-900"
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

      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-md p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">¿Eliminar paciente?</DialogTitle>
          </DialogHeader>
          <p className="text-lg mb-6">Esta acción no se puede deshacer. ¿Seguro que deseas eliminar este paciente?</p>
          <div className="flex justify-end gap-4">
            <button
              className="h-12 px-6 text-lg font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 transition text-gray-900"
              onClick={() => setDeleteId(null)}
              disabled={deleteLoading}
            >
              Cancelar
            </button>
            <button
              className="h-12 px-6 text-lg font-semibold rounded bg-red-500 text-white hover:bg-red-600 transition shadow"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPaciente} onOpenChange={v => !v && setEditPaciente(null)}>
        <DialogContent className="max-w-2xl p-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#4285f2]">Editar Paciente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="flex flex-col gap-8 mt-6">
            <div>
              <label className="block text-lg font-medium mb-2">Nombre *</label>
              <Input
                {...register("nombre")}
                defaultValue={editPaciente?.nombre}
                placeholder="Nombre del paciente"
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
                defaultValue={editPaciente?.apellido}
                placeholder="Apellido del paciente"
                className="h-12 px-4 text-lg"
              />
              {errors.apellido && (
                <p className="text-red-500 text-base mt-1">{errors.apellido.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Género *</label>
              <select
                {...register("genero")}
                defaultValue={editPaciente?.genero}
                className="h-12 px-4 text-lg border rounded w-full text-gray-900 bg-white"
              >
                <option value="" disabled>Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.genero && (
                <p className="text-red-500 text-base mt-1">{errors.genero.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Email *</label>
              <Input
                {...register("email")}
                defaultValue={editPaciente?.email}
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
                defaultValue={editPaciente?.telefono}
                placeholder="+1234567890"
                className="h-12 px-4 text-lg"
              />
              {errors.telefono && (
                <p className="text-red-500 text-base mt-1">{errors.telefono.message}</p>
              )}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">Fecha de Nacimiento *</label>
              <Input
                {...register("fecha_nacimiento")}
                defaultValue={editPaciente?.fecha_nacimiento}
                type="date"
                className="h-12 px-4 text-lg"
              />
              {errors.fecha_nacimiento && (
                <p className="text-red-500 text-base mt-1">{errors.fecha_nacimiento.message}</p>
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
                onClick={() => setEditPaciente(null)}
                className="h-12 px-6 text-lg font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 transition text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="h-12 px-6 text-lg font-semibold rounded bg-[#4285f2] text-white hover:bg-[#4285f2]/90 transition shadow"
              >
                {editLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 