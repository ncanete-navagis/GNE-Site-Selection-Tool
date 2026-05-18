import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-joyride']
  },
  server: {
    host: '0.0.0.0',   // Required: expose Vite outside the Docker container
    port: 5173,
    watch: {
      // Required on Windows: Docker volume mounts don't forward inotify events
      // from the Windows host to the Linux container, so polling is needed for HMR.
      usePolling: true,
      interval: 1000,   // Check for changes every 1 second
    }
  }
})
