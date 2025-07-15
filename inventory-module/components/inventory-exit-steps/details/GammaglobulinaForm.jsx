"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GammaglobulinaForm = GammaglobulinaForm;
const react_hook_form_1 = require("react-hook-form");
const SimpleTreatmentForm_1 = require("./SimpleTreatmentForm");
const gammaglobulinaItems = [
    'Hizentra 4GR',
    'Hizentra 2GR',
    'TENGELINE 10% 5G/50ML',
    'TENGELINE 10G/100ML',
    'HIGLOBIN 10GR',
];
function GammaglobulinaForm() {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const { fields, append } = (0, react_hook_form_1.useFieldArray)({
        control,
        name: 'items'
    });
    const addDetail = (detail) => {
        append(detail);
    };
    return (<SimpleTreatmentForm_1.SimpleTreatmentForm title="Gammaglobulina" subtipo="GAMMAGLOBULINA" items={gammaglobulinaItems} addDetail={addDetail}/>);
}
//# sourceMappingURL=GammaglobulinaForm.jsx.map