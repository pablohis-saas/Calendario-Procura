"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryUseForm = InventoryUseForm;
const React = __importStar(require("react"));
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("zod");
const zod_2 = require("@hookform/resolvers/zod");
const radio_group_1 = require("../ui/radio-group");
const input_1 = require("../ui/input");
const label_1 = require("../ui/label");
const button_1 = require("../ui/button");
const textarea_1 = require("../ui/textarea");
const ALERGENOS = [
    'Abedul', 'Ácaros', 'Álamo del este', 'Ambrosía', 'Caballo', 'Camarón',
    'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Cucaracha',
    'Mezcla pastos', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Trueno',
];
const presentacionSchema = zod_1.z.object({
    presentacion: zod_1.z.enum(['unidad', 'frasco'], {
        required_error: 'Selecciona una presentación',
    }),
});
const glicerinadoUnidadSchema = zod_1.z.object({
    nombrePaciente: zod_1.z.string().min(1, 'El nombre es obligatorio'),
    alergenos: zod_1.z.array(zod_1.z.string()).min(1, 'Selecciona al menos un alérgeno').max(6, 'Máximo 6 alérgenos'),
    cantidadAplicada: zod_1.z.number().min(0.1, 'Debe ser mayor a 0'),
    numeroDosis: zod_1.z.number().int().min(1, 'Debe ser al menos 1'),
    observaciones: zod_1.z.string().optional(),
    huboReaccion: zod_1.z.enum(['Sí', 'No']),
    descripcionReaccion: zod_1.z.string().optional(),
}).refine((data) => data.huboReaccion === 'No' || (data.descripcionReaccion && data.descripcionReaccion.length > 0), {
    message: 'Describe la reacción',
    path: ['descripcionReaccion'],
});
function InventoryUseForm() {
    const [formStep, setFormStep] = React.useState('inicio');
    const { register: registerPresentacion, handleSubmit: handleSubmitPresentacion, formState: { errors: errorsPresentacion }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(presentacionSchema),
        defaultValues: { presentacion: undefined },
    });
    function onSubmitPresentacion({ presentacion }) {
        if (presentacion === 'unidad')
            setFormStep('unidad');
        else if (presentacion === 'frasco')
            setFormStep('frasco');
    }
    const { register, handleSubmit, control, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_2.zodResolver)(glicerinadoUnidadSchema),
        defaultValues: {
            alergenos: [],
            huboReaccion: 'No',
        },
    });
    const huboReaccion = watch('huboReaccion');
    function onSubmitUnidad(data) {
        alert('Datos enviados: ' + JSON.stringify(data, null, 2));
    }
    return (<div className="max-w-md mx-auto p-4">
      {formStep === 'inicio' && (<form onSubmit={handleSubmitPresentacion(onSubmitPresentacion)} className="space-y-6">
          <div>
            <label_1.Label className="text-base text-[#1b2538]">Tipo de inmunoterapia</label_1.Label>
            <div className="mt-2 text-sm text-[#1b2538]">Glicerinado</div>
          </div>
          <div>
            <label_1.Label className="text-base text-[#1b2538] mb-2">Presentación</label_1.Label>
            <radio_group_1.RadioGroup className="space-y-2 mt-2" {...registerPresentacion('presentacion')}>
              <div className="flex items-center space-x-2">
                <radio_group_1.RadioGroupItem value="unidad" id="unidad"/>
                <label_1.Label htmlFor="unidad">Por unidad</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <radio_group_1.RadioGroupItem value="frasco" id="frasco"/>
                <label_1.Label htmlFor="frasco">En frasco</label_1.Label>
              </div>
            </radio_group_1.RadioGroup>
            {errorsPresentacion.presentacion && (<p className="text-red-600 text-xs mt-1">{errorsPresentacion.presentacion.message}</p>)}
          </div>
          <button_1.Button type="submit" className="w-full bg-[#1b2538] text-white">Siguiente</button_1.Button>
        </form>)}
      {formStep === 'unidad' && (<form onSubmit={handleSubmit(onSubmitUnidad)} className="space-y-6">
          <div>
            <label_1.Label htmlFor="nombrePaciente" className="text-base text-[#1b2538]">Nombre del paciente</label_1.Label>
            <input_1.Input id="nombrePaciente" {...register('nombrePaciente')} className="mt-2"/>
            {errors.nombrePaciente && <p className="text-red-600 text-xs mt-1">{errors.nombrePaciente.message}</p>}
          </div>
          <div>
            <label_1.Label className="text-base text-[#1b2538]">Alérgenos</label_1.Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALERGENOS.map(alergeno => (<label key={alergeno} className="flex items-center space-x-2">
                  <input type="checkbox" value={alergeno} {...register('alergenos')} className="accent-[#1b2538]"/>
                  <span>{alergeno}</span>
                </label>))}
            </div>
            {errors.alergenos && <p className="text-red-600 text-xs mt-1">{errors.alergenos.message}</p>}
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label_1.Label htmlFor="cantidadAplicada" className="text-base text-[#1b2538]">Cantidad aplicada (ml)</label_1.Label>
              <input_1.Input id="cantidadAplicada" type="number" step="0.1" min="0.1" {...register('cantidadAplicada', { valueAsNumber: true })} className="mt-2"/>
              {errors.cantidadAplicada && <p className="text-red-600 text-xs mt-1">{errors.cantidadAplicada.message}</p>}
            </div>
            <div className="flex-1">
              <label_1.Label htmlFor="numeroDosis" className="text-base text-[#1b2538]">Número de dosis</label_1.Label>
              <input_1.Input id="numeroDosis" type="number" min="1" step="1" {...register('numeroDosis', { valueAsNumber: true })} className="mt-2"/>
              {errors.numeroDosis && <p className="text-red-600 text-xs mt-1">{errors.numeroDosis.message}</p>}
            </div>
          </div>
          <div>
            <label_1.Label htmlFor="observaciones" className="text-base text-[#1b2538]">Observaciones</label_1.Label>
            <textarea_1.Textarea id="observaciones" {...register('observaciones')} className="mt-2"/>
          </div>
          <div>
            <label_1.Label className="text-base text-[#1b2538]">¿Hubo alguna reacción?</label_1.Label>
            <radio_group_1.RadioGroup className="space-y-2 mt-2" value={huboReaccion} onValueChange={val => {
                control.setValue('huboReaccion', val);
            }}>
              <div className="flex items-center space-x-2">
                <radio_group_1.RadioGroupItem value="Sí" id="huboReaccionSi"/>
                <label_1.Label htmlFor="huboReaccionSi">Sí</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <radio_group_1.RadioGroupItem value="No" id="huboReaccionNo"/>
                <label_1.Label htmlFor="huboReaccionNo">No</label_1.Label>
              </div>
            </radio_group_1.RadioGroup>
            {errors.huboReaccion && <p className="text-red-600 text-xs mt-1">{errors.huboReaccion.message}</p>}
          </div>
          {huboReaccion === 'Sí' && (<div>
              <label_1.Label htmlFor="descripcionReaccion" className="text-base text-[#1b2538]">Describe la reacción</label_1.Label>
              <textarea_1.Textarea id="descripcionReaccion" {...register('descripcionReaccion')} className="mt-2"/>
              {errors.descripcionReaccion && typeof errors.descripcionReaccion.message === 'string' && (<p className="text-red-600 text-xs mt-1">{errors.descripcionReaccion.message}</p>)}
            </div>)}
          <button_1.Button type="submit" className="w-full bg-[#1b2538] text-white">Registrar uso</button_1.Button>
        </form>)}
      {formStep === 'frasco' && (<div className="mt-8 text-center text-[#1b2538] text-lg">➡️ Aquí irán los campos para Glicerinado en frasco</div>)}
    </div>);
}
//# sourceMappingURL=form.jsx.map