import React, { useEffect, useState } from "react";
import { useCobros } from "@/hooks/useCobros";
import Conceptos from "@/components/Conceptos";
import Cobros from "@/components/Cobros";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { FaMoneyBillWave, FaUserMd, FaCreditCard, FaUser, FaCashRegister, FaUniversity, FaQuestion, FaRegCheckSquare } from "react-icons/fa";

interface DashboardMetrics {
  totalCobros: number;
  totalIngresos: number;
  promedioPorCobro: number;
  cobrosHoy: number;
  ingresosHoy: number;
  cobrosEsteMes: number;
  ingresosEsteMes: number;
  metodoPagoStats: Record<string, number>;
  conceptos: any[];
  metodos: any[];
  usuarios: any[];
}

const metodoPagoIcons: Record<string, React.ReactNode> = {
  EFECTIVO: <FaMoneyBillWave className="text-green-600" />,
  TARJETA_DEBITO: <FaCreditCard className="text-blue-600" />,
  TARJETA_CREDITO: <FaCreditCard className="text-purple-600" />,
  TRANSFERENCIA: <FaUniversity className="text-teal-600" />,
  CHEQUE: <FaRegCheckSquare className="text-gray-600" />,
  OTRO: <FaQuestion className="text-yellow-600" />,
  "Sin especificar": <FaQuestion className="text-gray-400" />,
};

const metodoPagoTextColor: Record<string, string> = {
  EFECTIVO: "text-green-700",
  TARJETA_DEBITO: "text-blue-700",
  TARJETA_CREDITO: "text-purple-700",
  TRANSFERENCIA: "text-teal-700",
  CHEQUE: "text-gray-700",
  OTRO: "text-yellow-700",
  "Sin especificar": "text-gray-500",
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCobros: 0,
    totalIngresos: 0,
    promedioPorCobro: 0,
    cobrosHoy: 0,
    ingresosHoy: 0,
    cobrosEsteMes: 0,
    ingresosEsteMes: 0,
    metodoPagoStats: {},
    conceptos: [],
    metodos: [],
    usuarios: [],
  });
  const [loading, setLoading] = useState(true);
  const [showConceptos, setShowConceptos] = useState(false);
  const [filteredCobros, setFilteredCobros] = useState<any[]>([]);

  // Usar el hook de cobros
  const { cobros, isLoading: cobrosLoading } = useCobros();

  useEffect(() => {
    if (cobros.length > 0) {
      calculateMetrics(cobros);
    }
  }, [cobros]);

  useEffect(() => {
    setLoading(cobrosLoading);
  }, [cobrosLoading]);

  const calculateMetrics = (cobros: any[]) => {
    // Usar hora local en lugar de UTC
    const now = new Date();
    const hoy = now.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en hora local
    const mesActual = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

    console.log("🔍 Debug - Dashboard calculateMetrics:");
    console.log("🔍 Debug - hoy:", hoy);
    console.log("🔍 Debug - mesActual:", mesActual);
    console.log("🔍 Debug - total cobros recibidos:", cobros.length);
    console.log("🔍 Debug - fechas de cobros (primeras 5):", cobros.slice(0, 5).map(c => c.fecha_cobro?.slice(0, 10)));
    console.log("🔍 Debug - fechas completas de cobros (primeras 5):", cobros.slice(0, 5).map(c => c.fecha_cobro));
    console.log("🔍 Debug - fechas convertidas a local (primeras 5):", cobros.slice(0, 5).map(c => {
      if (!c.fecha_cobro) return 'null';
      return new Date(c.fecha_cobro).toLocaleDateString('en-CA');
    }));
    console.log("🔍 Debug - comparación detallada:");
    cobros.slice(0, 5).forEach((cobro, index) => {
      if (cobro.fecha_cobro) {
        const fechaOriginal = cobro.fecha_cobro;
        const fechaLocal = new Date(cobro.fecha_cobro).toLocaleDateString('en-CA');
        const coincide = fechaLocal === hoy;
        console.log(`  Cobro ${index + 1}: Original=${fechaOriginal}, Local=${fechaLocal}, Coincide=${coincide}`);
      }
    });
    console.log("🔍 Debug - primer cobro completo:", cobros[0]);

    // Usar la fecha original del cobro (sin convertir a local) para comparación
    const cobrosHoy = cobros.filter(c => {
      if (!c.fecha_cobro) return false;
      // Extraer solo la fecha (YYYY-MM-DD) de la fecha original
      const fechaCobro = c.fecha_cobro.slice(0, 10);
      return fechaCobro === hoy;
    });
    
    const cobrosEsteMes = cobros.filter(c => {
      if (!c.fecha_cobro) return false;
      // Extraer solo el año-mes (YYYY-MM) de la fecha original
      const fechaCobro = c.fecha_cobro.slice(0, 7);
      return fechaCobro === mesActual;
    });

    console.log("🔍 Debug - cobrosHoy encontrados:", cobrosHoy.length);
    console.log("🔍 Debug - cobrosEsteMes encontrados:", cobrosEsteMes.length);

    const totalIngresos = cobros.reduce((sum, c) => sum + (c.monto_total || 0), 0);
    const ingresosHoy = cobrosHoy.reduce((sum, c) => sum + (c.monto_total || 0), 0);
    const ingresosEsteMes = cobrosEsteMes.reduce((sum, c) => sum + (c.monto_total || 0), 0);

    const metodoPagoStats = cobros.reduce((acc, c) => {
      const metodo = c.metodo_pago || "Sin especificar";
      acc[metodo] = (acc[metodo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setMetrics({
      totalCobros: cobros.length,
      totalIngresos,
      promedioPorCobro: cobros.length > 0 ? totalIngresos / cobros.length : 0,
      cobrosHoy: cobrosHoy.length,
      ingresosHoy,
      cobrosEsteMes: cobrosEsteMes.length,
      ingresosEsteMes,
      metodoPagoStats,
      conceptos: [],
      metodos: [],
      usuarios: [],
    });

    setFilteredCobros(cobros);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Función inteligente para formatear números grandes
  const formatSmartNumber = (value: number, isCurrency: boolean = false) => {
    if (value === 0) return isCurrency ? "$0" : "0";
    
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    
    if (absValue >= 1e9) {
      const formatted = (absValue / 1e9).toFixed(1);
      return `${sign}${isCurrency ? "$" : ""}${formatted}B`;
    } else if (absValue >= 1e6) {
      const formatted = (absValue / 1e6).toFixed(1);
      return `${sign}${isCurrency ? "$" : ""}${formatted}M`;
    } else if (absValue >= 1e3) {
      const formatted = (absValue / 1e3).toFixed(1);
      return `${sign}${isCurrency ? "$" : ""}${formatted}K`;
    } else {
      return isCurrency ? formatCurrency(value) : value.toLocaleString();
    }
  };

  // Función para formatear números con tooltip para valores completos
  const formatWithTooltip = (value: number, isCurrency: boolean = false) => {
    const smartValue = formatSmartNumber(value, isCurrency);
    const fullValue = isCurrency ? formatCurrency(value) : value.toLocaleString();
    
    // Si el valor formateado es diferente al valor completo, mostrar tooltip
    if (smartValue !== fullValue) {
      return (
        <span 
          className="cursor-help" 
          title={`${fullValue}`}
        >
          {smartValue}
        </span>
      );
    }
    
    return smartValue;
  };

  const metodoPagoMontos: Record<string, number> = {};
  filteredCobros.forEach(cobro => {
    if (Array.isArray(cobro.metodos_pago) && cobro.metodos_pago.length > 0) {
      cobro.metodos_pago.forEach((pago: any) => {
        const metodo = pago.metodo_pago || "Sin especificar";
        metodoPagoMontos[metodo] = (metodoPagoMontos[metodo] || 0) + Number(pago.monto || 0);
      });
    } else if (cobro.metodo_pago && cobro.monto_total) {
      const metodo = cobro.metodo_pago || "Sin especificar";
      metodoPagoMontos[metodo] = (metodoPagoMontos[metodo] || 0) + Number(cobro.monto_total || 0);
    }
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold text-white">Gestión de Cobros</h1>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition border border-green-700"
          onClick={() => setShowConceptos(true)}
        >
          Gestionar conceptos
        </button>
      </div>
      <div className="flex items-center gap-8 mb-12">
        {/* Botón de gestión de conceptos eliminado, la tabla está siempre visible */}
      </div>

      {/* Dashboard visual */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Resumen de Cobros</h1>
            <p className="text-2xl text-gray-600 mt-2">Visión general del sistema de cobros</p>
          </div>
          <div className="text-lg text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-10 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xl font-medium">Total Cobros</p>
                <p className="text-5xl font-extrabold">{metrics.totalCobros.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-400 bg-opacity-30 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-10 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xl font-medium">Ingresos Totales</p>
                <p className="text-5xl font-extrabold">{formatWithTooltip(metrics.totalIngresos, true)}</p>
              </div>
              <div className="p-4 bg-green-400 bg-opacity-30 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-10 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xl font-medium">Promedio por Cobro</p>
                <p className="text-5xl font-extrabold">{formatWithTooltip(metrics.promedioPorCobro, true)}</p>
              </div>
              <div className="p-4 bg-purple-400 bg-opacity-30 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-10 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xl font-medium">Cobros Hoy</p>
                <p className="text-5xl font-extrabold">{metrics.cobrosHoy}</p>
              </div>
              <div className="p-4 bg-orange-400 bg-opacity-30 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Métricas secundarias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <span className="mr-3">📅</span>
              Este Mes
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-6 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-lg text-gray-600">Cobros realizados</p>
                  <p className="text-3xl font-bold text-blue-600">{metrics.cobrosEsteMes}</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex justify-between items-center p-6 bg-green-50 rounded-xl">
                <div>
                  <p className="text-lg text-gray-600">Ingresos generados</p>
                  <p className="text-3xl font-bold text-green-600">{formatWithTooltip(metrics.ingresosEsteMes, true)}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <span className="mr-3">💳</span>
              Métodos de Pago
            </h3>
            <ul className="space-y-4">
              {Object.entries(metodoPagoMontos).map(([metodo, monto]) => (
                <li key={metodo} className="flex items-center justify-between text-lg">
                  <span className={`flex items-center gap-3 font-semibold ${metodoPagoTextColor[metodo] || metodoPagoTextColor["Sin especificar"]}`}>
                    {metodoPagoIcons[metodo] || metodoPagoIcons["Sin especificar"]}
                    {metodo.replace(/_/g, " ")}
                  </span>
                  <span className="font-bold text-green-700">{formatWithTooltip(monto, true)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Gestión de cobros siempre expandida */}
      <div className="mt-16 animate-fade-in">
        <Cobros embedded={true} />
      </div>
      <Dialog open={showConceptos} onOpenChange={v => setShowConceptos(v)}>
        <DialogContent className="max-w-6xl p-10 rounded-2xl">
          <Conceptos embedded={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 