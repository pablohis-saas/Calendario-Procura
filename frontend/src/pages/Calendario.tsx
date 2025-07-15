import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes, isBefore, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import PacienteSearch from "../components/PacienteSearch";
import { getPacientes, crearPaciente } from "../services/pacientesService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CalendarMonth from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const eventTypes = [
  { value: "primera_vez", label: "Consulta de primera vez", color: "#4285f2" },
  { value: "consulta", label: "Consulta", color: "#34a853" },
  { value: "otros", label: "Otros", color: "#a142f4" },
];

function loadEvents() {
  const data = localStorage.getItem(EVENT_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data).map((e: any) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
  } catch {
    return [];
  }
}

function saveEvents(events: any[]) {
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
}

const pacienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  genero: z.string().min(1, "El género es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
});

type PacienteForm = z.infer<typeof pacienteSchema>;

export default function Calendario() {
  const [events, setEvents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    id: "",
    title: "",
    start: new Date(),
    end: addMinutes(new Date(), 30),
    type: "primera_vez",
    descripcion: "",
    paciente: "",
    telefono: "",
    tipoPersonalizado: "",
  });
  const [error, setError] = useState("");
  const [overlapWarning, setOverlapWarning] = useState("");
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    cargarEventos();
    cargarPacientes();
  }, []);

  const cargarEventos = async () => {
    try {
      const res = await fetch("/api/citas");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      setEvents([]);
    }
  };

  const cargarPacientes = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (error) {
      // Silenciar error
    }
  };

  // Validar solapamiento
  function checkOverlap(start: Date, end: Date, ignoreId?: string) {
    return events.some(ev =>
      ev.id !== ignoreId &&
      ((isBefore(start, ev.end) && isAfter(end, ev.start)) ||
        (isBefore(ev.start, end) && isAfter(ev.end, start)))
    );
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setForm({
      id: "",
      title: "",
      start: slotInfo.start,
      end: slotInfo.end,
      type: "primera_vez",
      descripcion: "",
      paciente: "",
      telefono: "",
      tipoPersonalizado: "",
    });
    setError("");
    setEditMode(false);
    setOverlapWarning("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (form.end <= form.start) {
      setError("La hora de fin debe ser mayor a la de inicio");
      return;
    }
    if ((form.type === "primera_vez" || form.type === "consulta") && !form.paciente.trim()) {
      setError("El nombre del paciente es obligatorio para consultas");
      return;
    }
    if (form.type === "otros" && !form.tipoPersonalizado.trim()) {
      setError("Debe especificar el tipo de evento cuando selecciona 'Otros'");
      return;
    }
    if (checkOverlap(form.start, form.end, editMode ? form.id : undefined)) {
      setOverlapWarning("Advertencia: Este evento se solapa con otro existente.");
    } else {
      setOverlapWarning("");
    }
    if (editMode) {
      // TODO: Implementar edición real con PUT /api/citas/:id
      setEvents(events.map(ev => ev.id === form.id ? { ...form } : ev));
    } else {
      try {
        const res = await fetch("/api/citas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paciente_id: "dummy-paciente-id",
            usuario_id: "dummy-usuario-id",
            consultorio_id: "dummy-consultorio-id",
            fecha_inicio: form.start,
            fecha_fin: form.end,
            descripcion: form.descripcion,
            estado: "pendiente",
            color: eventTypes.find(t => t.value === form.type)?.color || "#3B82F6",
          }),
        });
        if (res.ok) {
          await cargarEventos();
        }
      } catch (error) {
        // Manejar error
      }
    }
    setModalOpen(false);
  };

  const handleSelectEvent = (event: any) => {
    setForm({
      ...event,
      paciente: event.paciente || "",
      telefono: event.telefono || "",
      descripcion: event.descripcion || "",
      tipoPersonalizado: event.tipoPersonalizado || "",
    });
    setError("");
    setEditMode(true);
    setOverlapWarning("");
    setModalOpen(true);
  };

  const handleDelete = () => {
    setEvents(events.filter(ev => ev.id !== form.id));
    setModalOpen(false);
  };

  const eventPropGetter = (event: any) => {
    const typeObj = eventTypes.find(t => t.value === event.type) || eventTypes[0];
    return {
      style: {
        color: '#223052',
        backgroundColor: typeObj.color + '22',
        border: `1.5px solid ${typeObj.color}`,
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '1rem',
        padding: '2px 8px',
      },
      title: event.type === 'otros' && event.tipoPersonalizado 
        ? event.tipoPersonalizado 
        : (event.type === 'primera_vez' || event.type === 'consulta') && event.paciente 
          ? `${typeObj.label}: ${event.paciente}` 
          : typeObj.label
    };
  };

  // Nueva función para renderizar la barra superior de fecha y navegación
  function BarraFechaNavegacion() {
    return (
      <div className="flex items-center justify-between w-full max-w-4xl mb-4 gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-7 h-7 text-blue-600" />
          <span className="text-2xl font-bold text-gray-800">
            {format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-gray-100 hover:bg-blue-100 p-2 text-xl transition"
            onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
            title="Día anterior"
          >
            <ChevronLeft className="w-5 h-5 text-blue-600" />
          </button>
          <button
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold transition"
            onClick={() => setDate(new Date())}
            title="Hoy"
          >
            Hoy
          </button>
          <button
            className="rounded-full bg-gray-100 hover:bg-blue-100 p-2 text-xl transition"
            onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
            title="Día siguiente"
          >
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] flex flex-row items-start justify-center gap-8">
      <style>{`
        .react-calendar__tile, .react-calendar__month-view__days__day, .react-calendar__month-view__weekdays__weekday, .react-calendar__navigation button {
          color: #223052 !important;
          font-weight: 500;
          font-size: 1.1rem;
          padding: 0.6em 0.6em !important;
        }
        .react-calendar__tile--active, .react-calendar__tile--now {
          background: #4285f2 !important;
          color: #fff !important;
          border-radius: 50% !important;
        }
        .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus {
          background: #2563eb !important;
          color: #fff !important;
        }
        .react-calendar__tile:disabled {
          color: #bbb !important;
        }
        .react-calendar {
          border: 1.5px solid #e5e7eb !important;
          border-radius: 1rem !important;
          box-shadow: 0 2px 8px 0 rgba(60,64,67,.08);
        }
      `}</style>
      {/* Calendario mensual a la izquierda */}
      <div className="rounded-xl shadow p-4 flex flex-col items-center min-w-[320px]" style={{ background: '#223052' }}>
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '0.5rem', width: '100%' }}>
          <CalendarMonth
            onChange={(d) => {
              const selectedDate = Array.isArray(d) ? d[0] : d;
              if (selectedDate) setDate(selectedDate);
            }}
            value={date}
            locale="es-ES"
            className="mb-2"
          />
        </div>
        <span className="text-sm text-white mt-2">Selecciona un día</span>
      </div>
      {/* Agenda diaria a la derecha */}
      <div className="flex-1 flex flex-col items-center">
        <BarraFechaNavegacion />
        <div className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-xl" style={{ overflowY: 'auto', maxHeight: '75vh' }}>
          <Calendar
            localizer={localizer}
            events={events}
            defaultView={Views.DAY}
            view={Views.DAY}
            date={date}
            onNavigate={setDate}
            views={[Views.DAY]}
            step={30}
            timeslots={2}
            min={new Date(2023, 0, 1, 6, 0)}
            max={new Date(2023, 0, 1, 23, 0)}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            style={{ height: "70vh" }}
            messages={{
              today: "Hoy",
              previous: "Anterior",
              next: "Siguiente",
              day: "Día",
              week: "Semana",
              month: "Mes",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango",
            }}
            culture="es"
            eventPropGetter={eventPropGetter}
            formats={{
              timeGutterFormat: (date: Date) => format(date, "HH:mm"),
              dayFormat: (date: Date) => format(date, "EEEE, d 'de' MMMM", { locale: es }),
            }}
            components={{
              // Mensaje amigable cuando no hay eventos
              eventWrapper: ({ children }: any) => (
                <div className="flex items-center justify-center h-full text-gray-400 text-xl font-medium">
                  {children}
                </div>
              ),
            }}
          />
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editMode ? "Editar evento" : "Nuevo evento"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <label className="flex-1 text-sm">
                  Tipo:
                  <select
                    className="w-full border rounded px-2 py-1 mt-1 text-gray-900 bg-white"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {eventTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex gap-2">
                <label className="flex-1 text-sm">
                  Inicio:
                  <Input
                    type="time"
                    step="900"
                    value={format(form.start, "HH:mm")}
                    onChange={e => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      const newStart = new Date(form.start);
                      newStart.setHours(h, m);
                      setForm(f => ({ ...f, start: newStart }));
                    }}
                    required
                  />
                </label>
                <label className="flex-1 text-sm">
                  Fin:
                  <Input
                    type="time"
                    step="900"
                    value={format(form.end, "HH:mm")}
                    onChange={e => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      const newEnd = new Date(form.end);
                      newEnd.setHours(h, m);
                      setForm(f => ({ ...f, end: newEnd }));
                    }}
                    required
                  />
                </label>
              </div>
              {(form.type === "primera_vez" || form.type === "consulta") && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium mb-1">Paciente:</label>
                  <PacienteSearch
                    pacientes={pacientes}
                    onPacienteSelect={p => setForm(f => ({ ...f, paciente: `${p.nombre} ${p.apellido}`, pacienteId: p.id }))}
                    placeholder="Buscar paciente por nombre o apellido..."
                  />
                  <button
                    type="button"
                    className="text-blue-600 underline text-sm mt-1 self-start"
                    onClick={() => setShowNuevoPaciente(v => !v)}
                  >
                    {showNuevoPaciente ? "Cancelar nuevo paciente" : "Agregar nuevo paciente"}
                  </button>
                  {showNuevoPaciente && (
                    <NuevoPacienteForm
                      onPacienteCreado={async (nuevo) => {
                        await cargarPacientes();
                        setForm(f => ({ ...f, paciente: `${nuevo.nombre} ${nuevo.apellido}`, pacienteId: nuevo.id }));
                        setShowNuevoPaciente(false);
                      }}
                    />
                  )}
                </div>
              )}
              <label className="text-sm block">
                Descripción:
                <Input
                  placeholder="Descripción o detalles"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                />
              </label>
              {form.type === "otros" && (
                <label className="text-sm block">
                  Tipo de evento:
                  <Input
                    placeholder="Describe el tipo de evento..."
                    value={form.tipoPersonalizado}
                    onChange={e => setForm(f => ({ ...f, tipoPersonalizado: e.target.value }))}
                    required
                  />
                </label>
              )}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {overlapWarning && <div className="text-yellow-600 text-sm">{overlapWarning}</div>}
              <div className="flex justify-between gap-2 mt-2">
                {editMode && (
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Eliminar
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function NuevoPacienteForm({ onPacienteCreado }: { onPacienteCreado: (p: any) => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PacienteForm>({ resolver: zodResolver(pacienteSchema) });
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (data: PacienteForm) => {
    setErrorMsg("");
    try {
      const nuevo = await crearPaciente(data);
      onPacienteCreado(nuevo);
      reset();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || "Error al registrar el paciente");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg p-4 mt-2 flex flex-col gap-2 border">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input {...register("nombre")} placeholder="Nombre" className="h-10 text-base" />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
        </div>
        <div className="flex-1">
          <Input {...register("apellido")} placeholder="Apellido" className="h-10 text-base" />
          {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input {...register("email")} placeholder="Email" className="h-10 text-base" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="flex-1">
          <Input {...register("telefono")} placeholder="Teléfono" className="h-10 text-base" />
          {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input {...register("fecha_nacimiento")} type="date" className="h-10 text-base" />
          {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento.message}</p>}
        </div>
        <div className="flex-1">
          <select {...register("genero")} className="h-10 text-base border rounded w-full px-2 text-gray-900 bg-white">
            <option value="">Género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero.message}</p>}
        </div>
      </div>
      {errorMsg && <div className="text-red-600 text-xs mb-1">{errorMsg}</div>}
      <div className="flex justify-end mt-2">
        <Button type="submit" disabled={isSubmitting} className="h-10 px-6 text-base">Guardar paciente</Button>
      </div>
    </form>
  );
} 