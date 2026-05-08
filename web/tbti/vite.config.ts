import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

// GitHub Actions 会注入 GITHUB_REPOSITORY=owner/repo；本地开发默认为 '/'
const base = repo ? `/${repo}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
