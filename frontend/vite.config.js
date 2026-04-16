import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'f510-2a05-45c2-623e-2a00-94f9-a4ed-2f80-5e01.ngrok-free.app'
    ]
  }
})
