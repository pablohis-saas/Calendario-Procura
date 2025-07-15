"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetrics = DashboardMetrics;
const card_1 = require("../ui/card");
const lucide_react_1 = require("lucide-react");
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
function DashboardMetrics({ totalInventoryValue, totalUsedInventoryCost, lowStockAlerts, expirationAlerts, }) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <card_1.Card className="bg-gray-100 rounded-2xl shadow-sm border border-[#1b2538]">
        <card_1.CardContent className="flex items-center gap-4 py-6">
          <lucide_react_1.DollarSign size={24} className="text-[#1b2538]"/>
          <div>
            <card_1.CardTitle className="text-[#1b2538] font-semibold text-base">Valor Total del Inventario</card_1.CardTitle>
            <div className="text-2xl font-bold text-[#1b2538]">{currency.format(totalInventoryValue)}</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card className="bg-gray-100 rounded-2xl shadow-sm border border-[#1b2538]">
        <card_1.CardContent className="flex items-center gap-4 py-6">
          <lucide_react_1.Package size={24} className="text-[#1b2538]"/>
          <div>
            <card_1.CardTitle className="text-[#1b2538] font-semibold text-base">Inventario Utilizado</card_1.CardTitle>
            <div className="text-2xl font-bold text-[#1b2538]">{currency.format(totalUsedInventoryCost)}</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card className="bg-gray-100 rounded-2xl shadow-sm border border-[#1b2538]">
        <card_1.CardContent className="flex items-center gap-4 py-6">
          <lucide_react_1.AlertTriangle size={24} className="text-[#1b2538]"/>
          <div>
            <card_1.CardTitle className="text-[#1b2538] font-semibold text-base">Alertas de Stock Bajo</card_1.CardTitle>
            <div className="text-2xl font-bold text-[#1b2538]">{lowStockAlerts.length}</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card className="bg-gray-100 rounded-2xl shadow-sm border border-[#1b2538]">
        <card_1.CardContent className="flex items-center gap-4 py-6">
          <lucide_react_1.Clock size={24} className="text-[#1b2538]"/>
          <div>
            <card_1.CardTitle className="text-[#1b2538] font-semibold text-base">Alertas de Vencimiento</card_1.CardTitle>
            <div className="text-2xl font-bold text-[#1b2538]">{expirationAlerts.length}</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
//# sourceMappingURL=DashboardMetrics.jsx.map