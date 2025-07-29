import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { 
  LayoutDashboard, 
  CreditCard, 
  Tags, 
  Users, 
  User, 
  Menu, 
  X,
  Calendar as CalendarIcon,
  Package
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const navigation = [
  { name: "Cobros", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Usuarios", href: "/usuarios", icon: User },
  { name: "Calendario", href: "/calendario", icon: CalendarIcon },
  { name: "Inventario", href: "/inventario", icon: Package },
];

export default function Layout({ children, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className="sidebar-bg flex flex-col h-screen fixed left-0 top-0 bottom-0 text-white w-[320px] min-w-[280px] max-w-[360px] shadow-lg z-40"
      >
        <div className="flex flex-col items-center py-10 px-6 border-b border-[#223052]">
          <Logo size="lg" />
        </div>
        <nav className="flex-1 flex flex-col gap-3 mt-10">
          {navigation.map((item) => {
            const active = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-5 px-8 py-5 rounded-xl transition-colors text-xl font-bold
                  ${active ? 'bg-[#223052] border-l-4 border-white text-white' : 'hover:bg-[#4285f2] hover:text-white hover:shadow-md text-gray-200'}
                `}
              >
                <item.icon className="w-9 h-9 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        {/* Logout button at the bottom */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-auto mb-8 mx-8 py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow transition-colors"
          >
            Cerrar sesión
          </button>
        )}
      </aside>
      {/* Main content */}
      <main className="flex-1 min-h-screen ml-[320px] bg-white p-8 overflow-y-auto transition-colors duration-300 flex justify-center">
        {children}
      </main>
    </div>
  );
} 