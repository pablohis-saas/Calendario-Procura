import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Usuarios from "./pages/Usuarios";
import DashboardPage from "./pages/DashboardPage";
import About from "./pages/About";
import Calendario from "./pages/Calendario";
import Login from './pages/Login';
import { useState, useEffect } from 'react';
// Nuevos imports de inventario
import InventarioDashboard from "./pages/inventario/Dashboard";
import InventarioEntrada from "./pages/inventario/Entrada";
import InventarioSalida from "./pages/inventario/Salida";
import InventarioUso from "./pages/inventario/Uso";
import DisponibilidadBloqueos from './pages/DisponibilidadBloqueos';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar si el token es válido
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp > currentTime) {
          setIsLoggedIn(true);
        } else {
          // Token expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  // Mostrar loading mientras verifica el token
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#2d3748]">
      <div className="text-white text-xl">Cargando...</div>
    </div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/about" element={<About />} />
          <Route path="/calendario" element={<Calendario />} />
          {/* Nuevas rutas de inventario */}
          <Route path="/inventario" element={<InventarioDashboard />} />
          <Route path="/inventario/dashboard" element={<InventarioDashboard />} />
          <Route path="/inventario/entrada" element={<InventarioEntrada />} />
          <Route path="/inventario/salida" element={<InventarioSalida />} />
          <Route path="/inventario/uso" element={<InventarioUso />} />
          <Route path="/disponibilidad-bloqueos" element={<DisponibilidadBloqueos />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
