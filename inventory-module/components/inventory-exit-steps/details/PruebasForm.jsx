"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PruebasForm = PruebasForm;
const react_hook_form_1 = require("react-hook-form");
const SimpleTreatmentForm_1 = require("./SimpleTreatmentForm");
const pruebasItems = [
    'ALEX molecular',
    'Phadiatop',
    'Prick',
    'Prick to prick',
    'Pruebas con alimentos',
    'Suero',
    'FeNO',
    'COVID/Influenza',
    'Estreptococo B',
    'Influenza A y B / Sincitial / Adenovirus',
];
function PruebasForm() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'items'
    });
    const addDetail = (detail) => {
        append(detail);
    };
    return (<SimpleTreatmentForm_1.SimpleTreatmentForm title="Pruebas" subtipo="PRUEBAS" items={pruebasItems} addDetail={addDetail}/>);
}
//# sourceMappingURL=PruebasForm.jsx.map