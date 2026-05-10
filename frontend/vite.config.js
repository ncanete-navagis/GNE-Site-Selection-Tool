import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Relaxing this to 'unsafe-none' for development to ensure Google Login 
      // popups can communicate back to the app without being blocked.
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
  },
})
