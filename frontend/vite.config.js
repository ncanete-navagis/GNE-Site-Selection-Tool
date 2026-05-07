import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Allow Google Sign-In popup to postMessage back to this window.
      // 'same-origin' (Vite default) blocks it; 'same-origin-allow-popups' permits it.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
