import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Относительный base: сборка работает и на корне домена, и в подкаталоге (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
