import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api/inventory': 'http://localhost:3002',
            '/api/inventory-entry': 'http://localhost:3002',
            '/api': 'http://localhost:3002',
        },
    },
    assetsInclude: ['**/*.pdf'],
});
