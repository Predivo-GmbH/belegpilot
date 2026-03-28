import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react-dom/') || (id.includes('/react/') && !id.includes('/react-router')))
              return 'react-vendor'
            if (id.includes('/react-router'))
              return 'router-vendor'
            if (id.includes('/@supabase/'))
              return 'supabase-vendor'
            if (id.includes('/@tanstack/react-query'))
              return 'query-vendor'
            if (id.includes('/@radix-ui/') || id.includes('/radix-ui/') || id.includes('/class-variance-authority/'))
              return 'ui-vendor'
            if (id.includes('/lucide-react/'))
              return 'icons-vendor'
            if (id.includes('/sonner/'))
              return 'sonner-vendor'
          }
        },
      },
    },
  },
})
