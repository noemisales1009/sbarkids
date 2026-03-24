import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'supabase-vendor': ['@supabase/supabase-js'],
            }
          }
        },
        minify: 'esbuild',
      },
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
      // Configuração para SPA - importante para React Router funcionar corretamente
      preview: {
        port: 3000,
        host: '0.0.0.0',
      }
    };
});
