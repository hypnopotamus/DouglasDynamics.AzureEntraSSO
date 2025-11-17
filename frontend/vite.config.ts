import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { env } from 'process';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            '^/api': {
                target: env["services__api__https__0"] ?? 'https://localhost:7114',
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            }
        },
    }
})
