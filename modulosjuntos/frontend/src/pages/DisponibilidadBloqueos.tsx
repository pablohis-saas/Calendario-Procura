import { useState, useEffect } from 'react'
import { useDisponibilidadesMedico, DisponibilidadMedico } from '../hooks/useDisponibilidadesMedico'
import { useBloqueosMedico, BloqueoMedico } from '../hooks/useBloqueosMedico'
import { getUsuarios } from '../services/usuariosService'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '../components/ui/select'

interface Usuario {
  id: string
  nombre: string
  apellido: string
  rol: string
}

function DisponibilidadBloqueos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedMedico, setSelectedMedico] = useState<string>('')
  const [tab, setTab] = useState<'disponibilidad' | 'bloqueos'>('disponibilidad')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<DisponibilidadMedico | BloqueoMedico | null>(null)

  // Hooks de datos
  const {
    disponibilidades,
    isLoading: isLoadingDisponibilidad,
    error: errorDisponibilidad,
    fetchDisponibilidades,
    create: createDisponibilidad,
    update: updateDisponibilidad,
    remove: removeDisponibilidad
  } = useDisponibilidadesMedico(selectedMedico)

  const {
    bloqueos,
    isLoading: isLoadingBloqueos,
    error: errorBloqueos,
    fetchBloqueos,
    create: createBloqueo,
    update: updateBloqueo,
    remove: removeBloqueo
  } = useBloqueosMedico(selectedMedico)

  // Cargar médicos
  useEffect(() => {
    getUsuarios().then(users => {
      const doctores = users.filter((u: Usuario) => u.rol === 'DOCTOR')
      setUsuarios(doctores)
      if (!selectedMedico && doctores.length > 0) setSelectedMedico(doctores[0].id)
    })
  }, [])

  // Recargar al cambiar médico
  useEffect(() => {
    if (selectedMedico) {
      fetchDisponibilidades()
      fetchBloqueos()
    }
  }, [selectedMedico])

  // Formularios modales
  function handleEdit(item: DisponibilidadMedico | BloqueoMedico) {
    setEditItem(item)
    setShowForm(true)
  }
  function handleNew() {
    setEditItem(null)
    setShowForm(true)
  }
  function handleClose() {
    setShowForm(false)
    setEditItem(null)
  }

  // Render
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-start py-10 px-2">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Disponibilidad y Bloqueos de Médico</h1>
        <div className="flex gap-4 mb-6 items-center justify-center">
          <label className="font-semibold">Médico:</label>
          <div className="w-64">
            <Select value={selectedMedico} onValueChange={setSelectedMedico}>
              <SelectTrigger className="w-full bg-white border text-gray-900">
                <SelectValue placeholder={usuarios.length === 0 ? 'No hay médicos disponibles' : 'Selecciona un médico'} />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                {usuarios.length === 0 && <div className="px-4 py-2 text-gray-500">No hay médicos registrados</div>}
                {usuarios.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.nombre} {u.apellido}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant={tab === 'disponibilidad' ? 'default' : 'outline'} onClick={() => setTab('disponibilidad')}>Disponibilidad</Button>
            <Button variant={tab === 'bloqueos' ? 'default' : 'outline'} onClick={() => setTab('bloqueos')}>Bloqueos</Button>
          </div>
        </div>
        {usuarios.length === 0 && (
          <div className="text-center text-red-500 font-semibold mb-8">No hay médicos registrados. Agrega médicos en la sección de usuarios.</div>
        )}
        {usuarios.length > 0 && tab === 'disponibilidad' && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Disponibilidad semanal</h2>
              <Button onClick={handleNew}>Agregar</Button>
            </div>
            {isLoadingDisponibilidad ? <div className="text-center py-8">Cargando...</div> : errorDisponibilidad ? <div className="text-red-500">{errorDisponibilidad}</div> : (
              <table className="w-full border text-sm bg-white text-gray-900">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2">Día</th>
                    <th>Hora inicio</th>
                    <th>Hora fin</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {disponibilidades.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-500 py-4">No hay disponibilidad registrada</td></tr>
                  ) : disponibilidades.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td>{diasSemana[d.dia_semana]}</td>
                      <td>{d.hora_inicio}</td>
                      <td>{d.hora_fin}</td>
                      <td>
                        <Button size="sm" onClick={() => handleEdit(d)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => removeDisponibilidad(d.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
        {usuarios.length > 0 && tab === 'bloqueos' && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Bloqueos puntuales</h2>
              <Button onClick={handleNew}>Agregar</Button>
            </div>
            {isLoadingBloqueos ? <div className="text-center py-8">Cargando...</div> : errorBloqueos ? <div className="text-red-500">{errorBloqueos}</div> : (
              <table className="w-full border text-sm bg-white text-gray-900">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2">Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Motivo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bloqueos.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-500 py-4">No hay bloqueos registrados</td></tr>
                  ) : bloqueos.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td>{formatLocal(b.fecha_inicio)}</td>
                      <td>{formatLocal(b.fecha_fin)}</td>
                      <td>{b.motivo || '-'}</td>
                      <td>
                        <Button size="sm" onClick={() => handleEdit(b)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => removeBloqueo(b.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogTitle>{editItem ? 'Editar' : 'Agregar'} {tab === 'disponibilidad' ? 'Disponibilidad' : 'Bloqueo'}</DialogTitle>
            {tab === 'disponibilidad' ? (
              <DisponibilidadForm
                initial={editItem as DisponibilidadMedico | undefined}
                medicoId={selectedMedico}
                onSave={async values => {
                  if (editItem) await updateDisponibilidad(editItem.id, values)
                  else await createDisponibilidad({ ...values, usuario_id: selectedMedico })
                  handleClose()
                }}
                onCancel={handleClose}
              />
            ) : (
              <BloqueoForm
                initial={editItem as BloqueoMedico | undefined}
                medicoId={selectedMedico}
                onSave={async values => {
                  if (editItem) await updateBloqueo(editItem.id, values)
                  else await createBloqueo({ ...values, usuario_id: selectedMedico })
                  handleClose()
                }}
                onCancel={handleClose}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

function DisponibilidadForm({ initial, medicoId, onSave, onCancel }:{
  initial?: DisponibilidadMedico
  medicoId: string
  onSave: (values: { dia_semana: number; hora_inicio: string; hora_fin: string }) => void
  onCancel: () => void
}) {
  const [dia_semana, setDiaSemana] = useState(initial?.dia_semana ?? 1)
  const [hora_inicio, setHoraInicio] = useState(initial?.hora_inicio ?? '')
  const [hora_fin, setHoraFin] = useState(initial?.hora_fin ?? '')
  const [error, setError] = useState<string | null>(null)

  function validate() {
    setError(null)
    if (!hora_inicio || !hora_fin) {
      setError('Debes ingresar hora de inicio y fin')
      return false
    }
    if (hora_inicio >= hora_fin) {
      setError('La hora de inicio debe ser menor que la de fin')
      return false
    }
    return true
  }

  return (
    <form className="space-y-4" onSubmit={e => {
      e.preventDefault()
      if (!validate()) return
      onSave({ dia_semana, hora_inicio, hora_fin })
    }}>
      <label className="block">Día de la semana
        <select className="w-full" value={dia_semana} onChange={e => setDiaSemana(Number(e.target.value))}>
          {diasSemana.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
      </label>
      <label className="block">Hora inicio
        <Input type="time" value={hora_inicio} onChange={e => setHoraInicio(e.target.value)} required />
      </label>
      <label className="block">Hora fin
        <Input type="time" value={hora_fin} onChange={e => setHoraFin(e.target.value)} required />
      </label>
      {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={!!error}>Guardar</Button>
      </div>
    </form>
  )
}

function BloqueoForm({ initial, medicoId, onSave, onCancel }:{
  initial?: BloqueoMedico
  medicoId: string
  onSave: (values: { usuario_id: string; fecha_inicio: string; fecha_fin: string; motivo?: string }) => void
  onCancel: () => void
}) {
  // Convierte UTC a local para input type="datetime-local"
  function toLocal(dt: string) {
    if (!dt) return ''
    const d = new Date(dt)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const min = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
  }
  // Convierte string local 'YYYY-MM-DDTHH:mm' a UTC ISO string (sin desfase)
  function localDateTimeToISOString(dt: string) {
    if (!dt) return ''
    const [date, time] = dt.split('T')
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    // Usa new Date local, no Date.UTC
    const d = new Date(year, month - 1, day, hour, minute)
    return d.toISOString()
  }

  const [fecha_inicio, setFechaInicio] = useState(initial?.fecha_inicio ? toLocal(initial.fecha_inicio) : '')
  const [fecha_fin, setFechaFin] = useState(initial?.fecha_fin ? toLocal(initial.fecha_fin) : '')
  const [motivo, setMotivo] = useState(initial?.motivo ?? '')
  const [error, setError] = useState<string | null>(null)

  function validate() {
    setError(null)
    if (!fecha_inicio || !fecha_fin) {
      setError('Debes ingresar fecha y hora de inicio y fin')
      return false
    }
    if (fecha_inicio >= fecha_fin) {
      setError('La fecha/hora de inicio debe ser menor que la de fin')
      return false
    }
    const now = new Date()
    const inicioDate = new Date(fecha_inicio)
    if (inicioDate < now) {
      setError('No puedes crear bloqueos en el pasado')
      return false
    }
    return true
  }

  return (
    <form className="space-y-4" onSubmit={e => {
      e.preventDefault()
      if (!validate()) return
      onSave({
        usuario_id: medicoId,
        fecha_inicio: localDateTimeToISOString(fecha_inicio),
        fecha_fin: localDateTimeToISOString(fecha_fin),
        motivo
      })
    }}>
      <label className="block">Fecha y hora inicio
        <Input type="datetime-local" value={fecha_inicio} onChange={e => setFechaInicio(e.target.value)} required />
      </label>
      <label className="block">Fecha y hora fin
        <Input type="datetime-local" value={fecha_fin} onChange={e => setFechaFin(e.target.value)} required />
      </label>
      <label className="block">Motivo
        <Input value={motivo} onChange={e => setMotivo(e.target.value)} />
      </label>
      {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={!!error}>Guardar</Button>
      </div>
    </form>
  )
}

// Helper para mostrar fecha/hora local en la tabla
function formatLocal(dt: string) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

export default DisponibilidadBloqueos 