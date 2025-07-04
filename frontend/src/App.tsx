import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Usuarios from "./pages/Usuarios";
import DashboardPage from "./pages/DashboardPage";
import About from "./pages/About";
import Calendario from "./pages/Calendario";
import Login from './pages/Login';
import { useState } from 'react';
// Nuevos imports de inventario
import InventarioDashboard from "./pages/inventario/Dashboard";
import InventarioEntrada from "./pages/inventario/Entrada";
import InventarioSalida from "./pages/inventario/Salida";
import InventarioUso from "./pages/inventario/Uso";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

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
          <Route path="/inventario" element={<InventarioDashboard searchParams={{}} />} />
          <Route path="/inventario/dashboard" element={<InventarioDashboard searchParams={{}} />} />
          <Route path="/inventario/entrada" element={<InventarioEntrada />} />
          <Route path="/inventario/salida" element={<InventarioSalida />} />
          <Route path="/inventario/uso" element={<InventarioUso />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
