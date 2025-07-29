import { useState } from "react";
import { useConceptos } from "./ConceptosContext";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useForm } from "react-hook-form";

export default function Conceptos({ embedded = false }: { embedded?: boolean }) {
  const { servicios, addServicio, loading, error, editServicio, deleteServicio } = useConceptos();
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [editConcepto, setEditConcepto] = useState<any>(null);
  const [deleteConcepto, setDeleteConcepto] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { register: editRegister, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm({
    defaultValues: { nombre: "", precio_base: "", descripcion: "" }
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setSuccessMsg("");
    try {
      await addServicio({ nombre, precio_base: Number(precio), descripcion });
      setSuccessMsg("Concepto agregado correctamente");
      setNombre("");
      setPrecio("");
      setDescripcion("");
      setShowForm(false);
    } catch (err) {
      setFormError("Error al agregar concepto");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (concepto: any) => {
    setEditConcepto(concepto);
    resetEdit({ nombre: concepto.nombre, precio_base: concepto.precio_base, descripcion: concepto.descripcion });
  };

  const handleEditSave = async (data: any) => {
    setEditLoading(true);
    try {
      await editServicio(editConcepto.id, { ...data, precio_base: Number(data.precio_base) });
      setEditConcepto(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteServicio(deleteConcepto.id);
      setDeleteConcepto(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={embedded ? "" : "w-full max-w-[1600px] pt-10"}>
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold text-[#4285f2]">Gestión de Conceptos</h1>
        <Button
          className="bg-[#4285f2] text-white h-14 px-10 rounded-xl shadow-lg hover:bg-[#4285f2]/90 transition text-2xl font-bold"
          onClick={() => setShowForm(true)}
        >
          Nuevo concepto
        </Button>
      </div>
      {successMsg && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-center animate-fade-in">
          {successMsg}
        </div>
      )}
      {loading && <div className="mb-4 text-blue-600">Cargando conceptos...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto mt-12">
        <table className="min-w-full border text-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-8 py-5 text-gray-700 text-lg">ID</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Nombre</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Precio Base</th>
              <th className="border px-8 py-5 text-gray-700 text-lg">Descripción</th>
              <th className="border px-8 py-5 text-gray-700 text-lg text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="hover:bg-gray-50 transition">
                <td className="border px-8 py-5 text-gray-900">{servicio.id}</td>
                <td className="border px-8 py-5 text-gray-900">{servicio.nombre}</td>
                <td className="border px-8 py-5 text-gray-900">${servicio.precio_base}</td>
                <td className="border px-8 py-5 text-gray-900">{servicio.descripcion || "-"}</td>
                <td className="border px-8 py-5 text-center">
                  <Button
                    className="bg-[#4285f2] text-white h-11 px-7 rounded-lg shadow-lg hover:bg-[#4285f2]/90 transition text-lg font-semibold mr-2"
                    onClick={() => handleEdit(servicio)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="bg-red-500 text-white h-11 px-7 rounded-lg shadow-lg hover:bg-red-600 transition text-lg font-semibold"
                    onClick={() => setDeleteConcepto(servicio)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de alta */}
      <Dialog open={showForm} onOpenChange={v => !v ? setShowForm(false) : null}>
        <DialogContent className="max-w-2xl p-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#4285f2]">Nuevo Concepto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-8 mt-6">
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Nombre *</label>
              <input
                type="text"
                className="w-full h-12 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Precio Base *</label>
              <input
                type="number"
                className="w-full h-12 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Descripción</label>
              <textarea
                className="w-full h-20 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
              />
            </div>
            {formError && <div className="text-red-600 text-base mb-2">{formError}</div>}
            <div className="flex justify-end gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-8 text-lg font-semibold"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-12 px-8 text-lg font-semibold bg-[#4285f2] text-white shadow hover:bg-[#4285f2]/90"
                disabled={formLoading}
              >
                {formLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal de edición */}
      <Dialog open={!!editConcepto} onOpenChange={v => !v ? setEditConcepto(null) : null}>
        <DialogContent className="max-w-2xl p-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-[#4285f2]">Editar Concepto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(handleEditSave)} className="flex flex-col gap-8 mt-6">
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Nombre *</label>
              <input
                type="text"
                className="w-full h-12 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                {...editRegister("nombre", { required: true })}
              />
              {editErrors.nombre && <span className="text-red-500 text-base">El nombre es requerido</span>}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Precio Base *</label>
              <input
                type="number"
                className="w-full h-12 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                {...editRegister("precio_base", { required: true })}
                min={0}
              />
              {editErrors.precio_base && <span className="text-red-500 text-base">El precio es requerido</span>}
            </div>
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-900">Descripción</label>
              <textarea
                className="w-full h-20 px-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                {...editRegister("descripcion")}
              />
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-8 text-lg font-semibold"
                onClick={() => setEditConcepto(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-12 px-8 text-lg font-semibold bg-[#4285f2] text-white shadow hover:bg-[#4285f2]/90"
                disabled={editLoading}
              >
                {editLoading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!deleteConcepto} onOpenChange={v => !v ? setDeleteConcepto(null) : null}>
        <DialogContent className="max-w-md p-8 rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">¿Eliminar concepto?</DialogTitle>
          </DialogHeader>
          <p className="text-lg text-gray-900 mb-8">Esta acción no se puede deshacer.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-lg font-semibold"
              onClick={() => setDeleteConcepto(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-12 px-8 text-lg font-semibold bg-red-500 text-white shadow hover:bg-red-600"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 