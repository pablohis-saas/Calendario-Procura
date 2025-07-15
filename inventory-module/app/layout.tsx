import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ProCura - Sistema de Inventario Médico',
  description: 'Sistema profesional de gestión de inventario para clínicas médicas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-[#f8fafc] min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-[#1b2538] text-white py-8 px-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-12">
              {/* Logo SVG o texto */}
              <span className="font-extrabold text-2xl tracking-tight">Pro<span className="text-blue-400">Cura</span></span>
            </div>
            <nav className="flex flex-col gap-4">
              <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors font-medium text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" /></svg>
                Dashboard
              </a>
              <a href="/inventory/entry" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors font-medium text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Entradas
              </a>
              <a href="/inventory/exit" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors font-medium text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m8 8H4" /></svg>
                Salidas
              </a>
            </nav>
            <div className="mt-auto pt-8 text-xs text-blue-200 opacity-60">Inventario v1.0</div>
          </aside>
          {/* Main content */}
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
        <Toaster 
          richColors 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  )
} 