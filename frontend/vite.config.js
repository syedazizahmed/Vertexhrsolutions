import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    // Prefer .tsx/.ts over .jsx/.js so new TypeScript files win over old JS duplicates
    extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: { port: 5173 },
});
