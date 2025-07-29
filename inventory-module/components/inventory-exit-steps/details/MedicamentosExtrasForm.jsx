"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicamentosExtrasForm = MedicamentosExtrasForm;
const react_hook_form_1 = require("react-hook-form");
const SimpleTreatmentForm_1 = require("./SimpleTreatmentForm");
const medicamentosExtrasItems = [
    'Bacmune',
    'Transferón',
    'Diprospán',
    'Nebulización',
];
function MedicamentosExtrasForm() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'items'
    });
    const addDetail = (detail) => {
        append(detail);
    };
    return (<SimpleTreatmentForm_1.SimpleTreatmentForm title="Medicamentos Extras" subtipo="MEDICAMENTOS_EXTRAS" items={medicamentosExtrasItems} addDetail={addDetail}/>);
}
//# sourceMappingURL=MedicamentosExtrasForm.jsx.map