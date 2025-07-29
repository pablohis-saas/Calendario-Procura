"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const sonner_1 = require("sonner");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'ProCura - Sistema de Inventario',
    description: 'Sistema de gestión de inventario médico',
};
function RootLayout({ children, }) {
    return (<html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <sonner_1.Toaster richColors/>
      </body>
    </html>);
}
//# sourceMappingURL=layout.jsx.map