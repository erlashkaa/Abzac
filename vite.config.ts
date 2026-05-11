import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': resolve(__dirname, './src'),
    },
    // Иначе рядом лежащие скомпилированные *.js перекрывают исходники *.tsx/*.ts
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.mts', '.cjs', '.json'],
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Оптимизация сборки
  build: {
    // Минификация через esbuild (быстрее и встроен в Vite)
    minify: 'esbuild',

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделение vendor библиотек
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx', 'motion/react'],
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
          ],
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Увеличение лимита для предупреждений
    chunkSizeWarningLimit: 1000,

    // Sourcemaps только для dev
    sourcemap: false,
  },

  // Оптимизация dev сервера
  server: {
    host: '127.0.0.1',
    hmr: {
      overlay: false, // Отключение overlay ошибок
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        timeout: 300_000,
        proxyTimeout: 300_000,
      },
    },
  },

  // Предварительная оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'motion/react',
    ],
  },
})
