import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import csv from 'vite-plugin-csv'

export default defineConfig({
  plugins: [
    react(),
    csv()
  ]
}) 