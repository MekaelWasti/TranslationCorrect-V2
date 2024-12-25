import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  esbuild: {
    // This disables type-checking during the build
    logLevel: 'silent',
  },
})
