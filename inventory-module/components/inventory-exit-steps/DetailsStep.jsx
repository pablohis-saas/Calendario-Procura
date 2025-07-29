"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailsStep = DetailsStep;
const react_hook_form_1 = require("react-hook-form");
const inventory_1 = require("../../types/inventory");
const InmunoterapiaForm_1 = require("./details/InmunoterapiaForm");
const PruebasForm_1 = require("./details/PruebasForm");
const ConsultaForm_1 = require("./details/ConsultaForm");
const GammaglobulinaForm_1 = require("./details/GammaglobulinaForm");
const VacunasPediatricasForm_1 = require("./details/VacunasPediatricasForm");
const MedicamentosExtrasForm_1 = require("./details/MedicamentosExtrasForm");
const renderDetailForm = (tipo) => {
    switch (tipo) {
        case inventory_1.TipoTratamiento.INMUNOTERAPIA:
            return <InmunoterapiaForm_1.InmunoterapiaForm />;
        case inventory_1.TipoTratamiento.PRUEBAS:
            return <PruebasForm_1.PruebasForm />;
        case inventory_1.TipoTratamiento.CONSULTA:
            return <ConsultaForm_1.ConsultaForm />;
        case inventory_1.TipoTratamiento.GAMMAGLOBULINA:
            return <GammaglobulinaForm_1.GammaglobulinaForm />;
        case inventory_1.TipoTratamiento.VACUNAS_PEDIATRICAS:
            return <VacunasPediatricasForm_1.VacunasPediatricasForm />;
        case inventory_1.TipoTratamiento.MEDICAMENTOS_EXTRAS:
            return <MedicamentosExtrasForm_1.MedicamentosExtrasForm />;
        default:
            return (<div className="text-center text-red-600">
          <p>Error: Tipo de tratamiento no seleccionado o no válido.</p>
          <p>Por favor, regrese y seleccione una opción.</p>
        </div>);
    }
};
function DetailsStep() {
    const { watch } = (0, react_hook_form_1.useFormContext)();
    const tipoTratamiento = watch('tipoTratamiento');
    return (<div>
      {renderDetailForm(tipoTratamiento)}
    </div>);
}
//# sourceMappingURL=DetailsStep.jsx.map