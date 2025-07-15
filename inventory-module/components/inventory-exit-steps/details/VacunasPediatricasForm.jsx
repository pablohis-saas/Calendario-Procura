"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacunasPediatricasForm = VacunasPediatricasForm;
const react_hook_form_1 = require("react-hook-form");
const SimpleTreatmentForm_1 = require("./SimpleTreatmentForm");
const vacunasPediatricasItems = [
    'Adacel Boost',
    'Gardasil',
    'Gardasil 9',
    'Hepatitis A y B',
    'Fiebre Amarilla',
    'Herpes Zóster',
    'Hexacima',
    'Influenza',
    'Menactra',
    'MMR',
    'Prevenar 13 V',
    'Proquad',
    'Pulmovax',
    'Rota Teq',
    'Vaqta',
    'Varivax',
];
function VacunasPediatricasForm() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'items'
    });
    const addDetail = (detail) => {
        append(detail);
    };
    return (<SimpleTreatmentForm_1.SimpleTreatmentForm title="Vacunas Pediátricas" subtipo="VACUNAS_PEDIATRICAS" items={vacunasPediatricasItems} addDetail={addDetail}/>);
}
//# sourceMappingURL=VacunasPediatricasForm.jsx.map