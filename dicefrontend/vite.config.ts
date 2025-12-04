import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { env } from 'process';
import { load } from "@azure/app-configuration-provider";
import { DefaultAzureCredential } from "@azure/identity";

const appConfig = (await load('https://ac-spa-dd-dice-frontend.azconfig.io', new DefaultAzureCredential())).constructConfigurationObject()

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react()],

    define: Object.entries({
        ...loadEnv(mode, process.cwd()),
        ...loadEnv(`${mode}.auth`, process.cwd()),
        ...appConfig
    }).reduce(
        (config, [key, value]) => ({ ...config, [`import.meta.env.${key}`]: JSON.stringify(value) }),
        {}
    ),

    server: {
        port: env["PORT"] ? parseInt(env["PORT"]) : 64634,
        proxy: {
            '^/api': {
                target: env["services__api__https__0"] ?? 'https://localhost:7261',
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.error('Proxy error:', err);
                    });

                    proxy.on('proxyReq', (_proxyReq, req, _res) => {
                        console.log('Sending Request to Target:', req.method, req.url);
                    });

                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    }
}));