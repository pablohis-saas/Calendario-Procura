"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientStep = PatientStep;
const react_hook_form_1 = require("react-hook-form");
const card_1 = require("../ui/card");
const input_1 = require("../ui/input");
const button_1 = require("../ui/button");
const label_1 = require("../ui/label");
function PatientStep({ onNext }) {
    const { register, formState: { errors }, } = (0, react_hook_form_1.useFormContext)();
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Datos del Paciente</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div>
          <label_1.Label htmlFor="nombrePaciente">Nombre del Paciente</label_1.Label>
          <input_1.Input id="nombrePaciente" {...register('nombrePaciente')} placeholder="Ej: Juan Pérez" className="mt-1"/>
          {errors.nombrePaciente && (<p className="text-red-600 text-xs mt-1">{errors.nombrePaciente.message}</p>)}
        </div>
        <button_1.Button onClick={onNext} className="w-full">
          Siguiente
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=PatientStep.jsx.map