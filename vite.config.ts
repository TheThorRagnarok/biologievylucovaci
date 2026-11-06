import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host: true = dev server dostupný i z telefonu ve stejné Wi-Fi (http://<IP-počítače>:5173)
  server: { host: true },
})
