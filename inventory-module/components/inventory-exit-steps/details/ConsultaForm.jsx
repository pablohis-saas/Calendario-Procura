"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultaForm = ConsultaForm;
const react_hook_form_1 = require("react-hook-form");
const SimpleTreatmentForm_1 = require("./SimpleTreatmentForm");
const consultaItems = [
    'Consulta',
];
function ConsultaForm() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'items'
    });
    const addDetail = (detail) => {
        append(detail);
    };
    return (<SimpleTreatmentForm_1.SimpleTreatmentForm title="Consulta" subtipo="CONSULTA" items={consultaItems} addDetail={addDetail} maxQuantity={3}/>);
}
//# sourceMappingURL=ConsultaForm.jsx.map