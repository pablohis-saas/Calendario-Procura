"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleTreatmentForm = SimpleTreatmentForm;
const react_1 = require("react");
const card_1 = require("../../ui/card");
const button_1 = require("../../ui/button");
const label_1 = require("../../ui/label");
const select_1 = require("../../ui/select");
function SimpleTreatmentForm({ title, subtipo, items, addDetail, maxQuantity = 10 }) {
    const [selectedItems, setSelectedItems] = (0, react_1.useState)({});
    const handleAddItem = (itemName, quantity) => {
        addDetail({
            subtipo: subtipo,
            nombreProducto: itemName,
            cantidad: quantity,
        });
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {items.map((item) => (<div key={item} className="flex items-center justify-between p-2 border rounded-md">
            <label_1.Label htmlFor={`item-${item}`}>{item}</label_1.Label>
            <div className="flex items-center space-x-2">
              <select_1.Select onValueChange={(val) => {
                const newSelectedItems = { ...selectedItems, [item]: Number(val) };
                setSelectedItems(newSelectedItems);
            }} defaultValue="1">
                <select_1.SelectTrigger className="w-20"><select_1.SelectValue /></select_1.SelectTrigger>
                <select_1.SelectContent>
                  {[...Array(maxQuantity)].map((_, i) => (<select_1.SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
              <button_1.Button onClick={() => handleAddItem(item, selectedItems[item] || 1)} size="sm">Añadir</button_1.Button>
            </div>
          </div>))}
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=SimpleTreatmentForm.jsx.map