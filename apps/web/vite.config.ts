import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { Environment } from './src/env/env'

// --------------------plugins--------------------

type Env = Record<string, string>

const envPlugin = (env: Env) => ({
   name: 'env',
   transform: () => {
      Environment.config(env)
   },
})

// --------------------config--------------------

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd())

   return {
      plugins: [
         envPlugin(env),
         tsconfigPaths(),
         tailwindcss(), // This will automatically find your CSS file
         tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
         }),
         react()
      ],
      server: {
         host: true,
         port: 3000,
         open: true,
         proxy: { '/trpc': { target: 'http://localhost:3001' } },
      },
      resolve: {
         alias: {
            "@": path.resolve(__dirname, "./src"),
         },
      },
   }
})
