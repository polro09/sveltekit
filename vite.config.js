// 📁 파일: vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        port: 5173,
        host: true,
        strictPort: false
    },
    preview: {
        port: 4173,
        host: true
    }
});