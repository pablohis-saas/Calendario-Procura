"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InmunoterapiaForm = InmunoterapiaForm;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const card_1 = require("../../ui/card");
const button_1 = require("../../ui/button");
const input_1 = require("../../ui/input");
const label_1 = require("../../ui/label");
const select_1 = require("../../ui/select");
const checkbox_1 = require("../../ui/checkbox");
const radio_group_1 = require("../../ui/radio-group");
const INMUNOTERAPIA_SUBTYPES = {
    glicerinado: 'Glicerinado',
    alxoid: 'Alxoid',
    sublingual: 'Sublingual',
};
const ALERGENOS_DATA = {
    glicerinado: ['Abedul', 'Ácaros', 'Álamo del este', 'Ambrosía', 'Caballo', 'Camarón', 'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Cucaracha', 'Mezcla pastos', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Trueno'],
    sublingual: ['Abedul', 'Ácaros', 'Álamo del este', 'Alheña', 'Ambrosía', 'Caballo', 'Camarón', 'Ciprés de Arizona', 'Encino', 'Fresno blanco', 'Gato', 'Manzana', 'Mezcla cucarachas', 'Mezcla pastos', 'Mezquite', 'Perro', 'Pescado varios', 'Pino blanco', 'Pistache', 'Sweet gum', 'Trueno'],
    alxoid: ['Ambrosía', 'Ácaros', 'Cupressus Arizónica', 'Encino', 'Fresno', 'Gato', 'Gramínea con sinodon', 'Sinodon', 'Perro', '6 Gramíneas'],
};
function GlicerinadoForm({ addDetail }) {
    const [mode, setMode] = (0, react_1.useState)('unidad');
    const [unidades, setUnidades] = (0, react_1.useState)(1);
    const [dosis, setDosis] = (0, react_1.useState)(1);
    const [frascoUnidad, setFrascoUnidad] = (0, react_1.useState)('Madre');
    const [selectedFrascos, setSelectedFrascos] = (0, react_1.useState)([]);
    const [numFrascosMismo, setNumFrascosMismo] = (0, react_1.useState)(1);
    const [selectedAlergenos, setSelectedAlergenos] = (0, react_1.useState)([]);
    const handleAdd = () => {
        if (selectedAlergenos.length === 0) {
            alert('Por favor, seleccione al menos un alérgeno.');
            return;
        }
        let detail;
        if (mode === 'unidad') {
            detail = {
                subtipo: 'GLICERINADO_UNIDAD',
                nombreProducto: 'Glicerinado por Unidad',
                cantidad: unidades,
                alergenos: selectedAlergenos,
                frasco: frascoUnidad,
            };
        }
        else {
            if (selectedFrascos.length === 0) {
                alert('Por favor, seleccione al menos un número de frasco.');
                return;
            }
            detail = {
                subtipo: 'GLICERINADO_FRASCO',
                nombreProducto: 'Glicerinado en Frasco',
                cantidad: numFrascosMismo,
                alergenos: selectedAlergenos,
                frasco: `Frascos: ${selectedFrascos.join(', ')}`,
            };
        }
        addDetail(detail);
        setUnidades(1);
        setDosis(1);
        setFrascoUnidad('Madre');
        setSelectedFrascos([]);
        setNumFrascosMismo(1);
        setSelectedAlergenos([]);
    };
    return (<div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Glicerinado</h4>
      
      <radio_group_1.RadioGroup value={mode} onValueChange={(value) => setMode(value)} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <radio_group_1.RadioGroupItem value="unidad" id="unidad"/>
          <label_1.Label htmlFor="unidad">Por Unidad</label_1.Label>
        </div>
        <div className="flex items-center space-x-2">
          <radio_group_1.RadioGroupItem value="frasco" id="frasco"/>
          <label_1.Label htmlFor="frasco">En Frasco</label_1.Label>
        </div>
      </radio_group_1.RadioGroup>

      {mode === 'unidad' && (<div className="space-y-4">
          <label_1.Label>Unidades</label_1.Label>
          <input_1.Input type="number" value={unidades} onChange={(e) => setUnidades(Number(e.target.value))} min="1"/>
          <label_1.Label>Frasco</label_1.Label>
          <select_1.Select value={frascoUnidad} onValueChange={setFrascoUnidad}>
            <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="Madre">Madre</select_1.SelectItem>
              <select_1.SelectItem value="Amarillo">Amarillo</select_1.SelectItem>
              <select_1.SelectItem value="Verde">Verde</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <label_1.Label>¿Cuántas dosis? (1-12)</label_1.Label>
          <input_1.Input type="number" value={dosis} onChange={(e) => setDosis(Number(e.target.value))} min="1" max="12"/>
        </div>)}
      
      {mode === 'frasco' && (<div className="space-y-4">
            <div>
                <label_1.Label>¿Qué frascos?</label_1.Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {[...Array(6)].map((_, i) => (<div key={i} className="flex items-center space-x-2">
                            <checkbox_1.Checkbox id={`frasco-${i + 1}`} onCheckedChange={(checked) => {
                    const frascoNum = (i + 1).toString();
                    setSelectedFrascos(prev => checked ? [...prev, frascoNum] : prev.filter(f => f !== frascoNum));
                }} checked={selectedFrascos.includes((i + 1).toString())}/>
                            <label_1.Label htmlFor={`frasco-${i + 1}`}>{i + 1}</label_1.Label>
                        </div>))}
                </div>
            </div>
            <div>
                <label_1.Label>¿Cuántos frascos del mismo? (1-5)</label_1.Label>
                <select_1.Select value={numFrascosMismo.toString()} onValueChange={(val) => setNumFrascosMismo(Number(val))}>
                    <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                    <select_1.SelectContent>
                        {[...Array(5)].map((_, i) => (<select_1.SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</select_1.SelectItem>))}
                    </select_1.SelectContent>
                </select_1.Select>
            </div>
        </div>)}

      <div>
        <label_1.Label>Alérgenos (máx. 6)</label_1.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {ALERGENOS_DATA.glicerinado.map(alergeno => (<div key={alergeno} className="flex items-center space-x-2">
              <checkbox_1.Checkbox id={`glicerinado-${alergeno}`} onCheckedChange={(checked) => {
                setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno));
            }} checked={selectedAlergenos.includes(alergeno)} disabled={selectedAlergenos.length >= 6 && !selectedAlergenos.includes(alergeno)}/>
              <label_1.Label htmlFor={`glicerinado-${alergeno}`}>{alergeno}</label_1.Label>
            </div>))}
        </div>
      </div>

      <button_1.Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Glicerinado</button_1.Button>
    </div>);
}
function AlxoidForm({ addDetail }) {
    const [tipoAlxoid, setTipoAlxoid] = (0, react_1.useState)('A');
    const [dosis, setDosis] = (0, react_1.useState)(1);
    const [selectedAlergenos, setSelectedAlergenos] = (0, react_1.useState)([]);
    const handleAdd = () => {
        if (selectedAlergenos.length === 0) {
            alert('Por favor, seleccione al menos un alérgeno.');
            return;
        }
        addDetail({
            subtipo: `ALXOID_${tipoAlxoid}`,
            nombreProducto: `Alxoid Tipo ${tipoAlxoid}`,
            cantidad: dosis,
            alergenos: selectedAlergenos,
        });
        setTipoAlxoid('A');
        setDosis(1);
        setSelectedAlergenos([]);
    };
    return (<div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Alxoid</h4>
      <label_1.Label>Tipo</label_1.Label>
      <select_1.Select value={tipoAlxoid} onValueChange={setTipoAlxoid}>
        <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
        <select_1.SelectContent>
          <select_1.SelectItem value="A">Tipo A</select_1.SelectItem>
          <select_1.SelectItem value="B">Tipo B</select_1.SelectItem>
          <select_1.SelectItem value="B.2">Tipo B.2</select_1.SelectItem>
        </select_1.SelectContent>
      </select_1.Select>
      <label_1.Label>¿Cuántas dosis? (1-10)</label_1.Label>
      <input_1.Input type="number" value={dosis} onChange={(e) => setDosis(Number(e.target.value))} min="1" max="10"/>
      <div>
        <label_1.Label>Alérgenos</label_1.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {ALERGENOS_DATA.alxoid.map(alergeno => (<div key={alergeno} className="flex items-center space-x-2">
              <checkbox_1.Checkbox id={`alxoid-${alergeno}`} onCheckedChange={(checked) => {
                setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno));
            }} checked={selectedAlergenos.includes(alergeno)}/>
              <label_1.Label htmlFor={`alxoid-${alergeno}`}>{alergeno}</label_1.Label>
            </div>))}
        </div>
      </div>
      <button_1.Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Alxoid</button_1.Button>
    </div>);
}
function SublingualForm({ addDetail }) {
    const [numeroFrasco, setNumeroFrasco] = (0, react_1.useState)(1);
    const [selectedAlergenos, setSelectedAlergenos] = (0, react_1.useState)([]);
    const handleAdd = () => {
        if (selectedAlergenos.length === 0) {
            alert('Por favor, seleccione al menos un alérgeno.');
            return;
        }
        addDetail({
            subtipo: 'SUBLINGUAL',
            nombreProducto: `Sublingual Frasco #${numeroFrasco}`,
            cantidad: 1,
            alergenos: selectedAlergenos,
            frasco: numeroFrasco.toString(),
        });
        setNumeroFrasco(1);
        setSelectedAlergenos([]);
    };
    return (<div className="p-4 border rounded-md bg-slate-50 space-y-4">
      <h4 className="font-semibold text-lg">Sublingual</h4>
      <label_1.Label>Número de frasco (1-4)</label_1.Label>
      <input_1.Input type="number" value={numeroFrasco} onChange={(e) => setNumeroFrasco(Number(e.target.value))} min="1" max="4"/>
      
      <div>
        <label_1.Label>Alérgenos</label_1.Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
          {ALERGENOS_DATA.sublingual.map(alergeno => (<div key={alergeno} className="flex items-center space-x-2">
              <checkbox_1.Checkbox id={`sublingual-${alergeno}`} onCheckedChange={(checked) => {
                setSelectedAlergenos(prev => checked ? [...prev, alergeno] : prev.filter(a => a !== alergeno));
            }} checked={selectedAlergenos.includes(alergeno)}/>
              <label_1.Label htmlFor={`sublingual-${alergeno}`}>{alergeno}</label_1.Label>
            </div>))}
        </div>
      </div>
      <button_1.Button onClick={handleAdd} type="button" className="w-full">Añadir Detalle de Sublingual</button_1.Button>
    </div>);
}
function InmunoterapiaForm() {
    const { control, formState: { errors } } = (0, react_hook_form_1.useFormContext)();
    const [subType, setSubType] = (0, react_1.useState)(null);
    const { fields, append, remove } = (0, react_hook_form_1.useFieldArray)({ control, name: "items" });
    const addDetail = (detail) => { append(detail); };
    const renderSubTypeForm = () => {
        switch (subType) {
            case 'glicerinado': return <GlicerinadoForm addDetail={addDetail}/>;
            case 'alxoid': return <AlxoidForm addDetail={addDetail}/>;
            case 'sublingual': return <SublingualForm addDetail={addDetail}/>;
            default: return null;
        }
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Items de Inmunoterapia</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        <div>
          <label_1.Label>Subtipo de Inmunoterapia</label_1.Label>
          <select_1.Select onValueChange={(value) => setSubType(value)}>
            <select_1.SelectTrigger><select_1.SelectValue placeholder="Selecciona un subtipo..."/></select_1.SelectTrigger>
            <select_1.SelectContent>
              {Object.entries(INMUNOTERAPIA_SUBTYPES).map(([key, label]) => (<select_1.SelectItem key={key} value={key}>{label}</select_1.SelectItem>))}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {renderSubTypeForm()}

        <div className="space-y-2 pt-4">
          <h3 className="text-sm font-medium">Items Agregados:</h3>
          {fields.length === 0 && <p className="text-xs text-gray-500">Aún no se han agregado items.</p>}
          {fields.map((field, index) => (<div key={field.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <p className="font-semibold">{field.nombreProducto}</p>
                {field.alergenos && <p className="text-xs text-gray-600">{field.alergenos.join(', ')}</p>}
              </div>
              <button_1.Button onClick={() => remove(index)} variant="destructive" size="sm" type="button">X</button_1.Button>
            </div>))}
        </div>

        {errors.items && <p className="text-red-600 text-xs mt-1">{errors.items.message}</p>}
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=InmunoterapiaForm.jsx.map