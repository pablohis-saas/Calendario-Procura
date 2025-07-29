"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventoryExitForm;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const hooks_1 = require("next-safe-action/hooks");
const sonner_1 = require("sonner");
const inventory_usage_1 = require("../../../schemas/inventory-usage");
const inventory_usage_2 = require("../../actions/inventory-usage");
const PatientStep_1 = require("../../../components/inventory-exit-steps/PatientStep");
const TreatmentTypeStep_1 = require("../../../components/inventory-exit-steps/TreatmentTypeStep");
const DetailsStep_1 = require("../../../components/inventory-exit-steps/DetailsStep");
const button_1 = require("../../../components/ui/button");
const label_1 = require("../../../components/ui/label");
const radio_group_1 = require("../../../components/ui/radio-group");
const textarea_1 = require("../../../components/ui/textarea");
const steps = ['PATIENT_NAME', 'TREATMENT_TYPE', 'DETAILS', 'SUMMARY'];
function ReactionForm() {
    const { register, control } = (0, react_hook_form_1.useFormContext)();
    const tuvoReaccion = (0, react_hook_form_1.useWatch)({
        control,
        name: 'tuvoReaccion'
    });
    return (<div className="space-y-4">
             <div className="space-y-2">
                <label_1.Label>Observaciones Adicionales</label_1.Label>
                <textarea_1.Textarea {...register('observaciones')} placeholder="Anotaciones sobre el tratamiento o el paciente..."/>
            </div>
            <div className="space-y-2">
                <label_1.Label>¿El paciente tuvo alguna reacción?</label_1.Label>
                 <react_hook_form_1.Controller name="tuvoReaccion" control={control} render={({ field }) => (<radio_group_1.RadioGroup onValueChange={(value) => field.onChange(value === 'true')} value={String(field.value)} className="flex items-center">
                            <div className="flex items-center space-x-2">
                                <radio_group_1.RadioGroupItem value="true" id="reaccion-si"/>
                                <label_1.Label htmlFor="reaccion-si">Sí</label_1.Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <radio_group_1.RadioGroupItem value="false" id="reaccion-no"/>
                                <label_1.Label htmlFor="reaccion-no">No</label_1.Label>
                            </div>
                        </radio_group_1.RadioGroup>)}/>
            </div>
            {tuvoReaccion === true && (<div className="space-y-2">
                    <label_1.Label>Descripción de la Reacción</label_1.Label>
                    <textarea_1.Textarea {...register('descripcionReaccion')} placeholder="Detalle la reacción observada..."/>
                </div>)}
        </div>);
}
function SummaryStep({ onBack, isPending }) {
    const { control } = (0, react_hook_form_1.useFormContext)();
    const [nombrePaciente, items] = (0, react_hook_form_1.useWatch)({
        control,
        name: ['nombrePaciente', 'items']
    });
    return (<div>
            <h3 className="text-lg font-semibold">Resumen y Reacciones</h3>
            <div className="p-4 my-4 border rounded-md bg-muted/50">
                <p><strong>Paciente:</strong> {nombrePaciente}</p>
                <p className="mt-2"><strong>Items aplicados:</strong></p>
                <ul className="pl-5 list-disc">
                    {(items || []).map((d, i) => <li key={i}>{d.nombreProducto} - Cantidad: {d.cantidad}</li>)}
                </ul>
            </div>

            <ReactionForm />

            <div className="flex justify-between mt-8">
                <button_1.Button onClick={onBack} variant="outline" type="button" disabled={isPending}>Atrás</button_1.Button>
                <button_1.Button type="submit" disabled={isPending}>
                    {isPending ? 'Registrando...' : 'Registrar Salida'}
                </button_1.Button>
            </div>
        </div>);
}
function InventoryExitForm() {
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const methods = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(inventory_usage_1.inventoryUsageSchema),
        mode: 'onChange',
        defaultValues: {
            items: [],
            tuvoReaccion: false,
        },
    });
    const { execute, result, status } = (0, hooks_1.useAction)(inventory_usage_2.processInventoryUsage, {
        onSuccess: (res) => {
            if (res.data?.success) {
                sonner_1.toast.success(res.data.success);
                methods.reset();
                setCurrentStep(0);
            }
            else if (res.data?.failure) {
                sonner_1.toast.error(res.data.failure);
            }
        },
        onError: (error) => {
            sonner_1.toast.error('Ocurrió un error inesperado.');
            console.error(error);
        }
    });
    const handleNext = async () => {
        let fieldsToValidate = [];
        if (steps[currentStep] === 'PATIENT_NAME')
            fieldsToValidate.push('nombrePaciente');
        if (steps[currentStep] === 'TREATMENT_TYPE')
            fieldsToValidate.push('tipoTratamiento');
        if (steps[currentStep] === 'DETAILS')
            fieldsToValidate.push('items');
        const isValid = await methods.trigger(fieldsToValidate);
        if (isValid)
            setCurrentStep((prev) => prev + 1);
    };
    const handleBack = () => setCurrentStep((prev) => prev - 1);
    const onSubmit = (data) => {
        execute(data);
    };
    return (<react_hook_form_1.FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {steps[currentStep] === 'PATIENT_NAME' && <PatientStep_1.PatientStep onNext={handleNext}/>}
        {steps[currentStep] === 'TREATMENT_TYPE' && <TreatmentTypeStep_1.TreatmentTypeStep onNext={handleNext} onBack={handleBack}/>}
        {steps[currentStep] === 'DETAILS' && (<div>
            <DetailsStep_1.DetailsStep />
            <div className="flex justify-between mt-4">
                <button_1.Button onClick={handleBack} variant="outline" type="button">Atrás</button_1.Button>
                <button_1.Button onClick={handleNext} type="button">Siguiente</button_1.Button>
            </div>
          </div>)}
        {steps[currentStep] === 'SUMMARY' && <SummaryStep onBack={handleBack} isPending={status === 'executing'}/>}
      </form>
    </react_hook_form_1.FormProvider>);
}
//# sourceMappingURL=InventoryExitForm.jsx.map