"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentTypeStep = TreatmentTypeStep;
const react_hook_form_1 = require("react-hook-form");
const card_1 = require("../ui/card");
const button_1 = require("../ui/button");
const radio_group_1 = require("../ui/radio-group");
const label_1 = require("../ui/label");
const inventory_1 = require("../../types/inventory");
const treatmentLabels = {
    [inventory_1.TipoTratamiento.INMUNOTERAPIA]: 'Inmunoterapia',
    [inventory_1.TipoTratamiento.PRUEBAS]: 'Pruebas',
    [inventory_1.TipoTratamiento.GAMMAGLOBULINA]: 'Gammaglobulina',
    [inventory_1.TipoTratamiento.VACUNAS_PEDIATRICAS]: 'Vacunas Pediátricas',
    [inventory_1.TipoTratamiento.MEDICAMENTOS_EXTRAS]: 'Medicamentos Extras',
    [inventory_1.TipoTratamiento.CONSULTA]: 'Consulta',
};
function TreatmentTypeStep({ onNext, onBack }) {
    const { setValue, formState: { errors } } = (0, react_hook_form_1.useFormContext)();
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Tipo de Tratamiento</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <radio_group_1.RadioGroup name="tipoTratamiento" onValueChange={(value) => setValue('tipoTratamiento', value)}>
          <div className="space-y-2">
            {Object.values(inventory_1.TipoTratamiento).map((tipo) => (<div key={tipo} className="flex items-center space-x-2">
                <radio_group_1.RadioGroupItem value={tipo} id={tipo}/>
                <label_1.Label htmlFor={tipo}>{treatmentLabels[tipo]}</label_1.Label>
              </div>))}
          </div>
        </radio_group_1.RadioGroup>
        {errors.tipoTratamiento && (<p className="text-red-600 text-xs mt-1">{errors.tipoTratamiento.message}</p>)}
        <div className="flex justify-between">
          <button_1.Button onClick={onBack} variant="outline">
            Atrás
          </button_1.Button>
          <button_1.Button onClick={onNext}>Siguiente</button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=TreatmentTypeStep.jsx.map