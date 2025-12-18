
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the browser to see the API_KEY from your environment variables.
    // It will check for 'API_KEY' first, then the 'gemini_api_key' you added.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.gemini_api_key || process.env.GEMINI_API_KEY)
  },
  build: {
    outDir: 'dist'
  }
});
