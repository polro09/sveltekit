// 📁 파일: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                // Discord 색상
                discord: {
                    blurple: '#5865F2',
                    green: '#57F287',
                    yellow: '#FEE75C',
                    fuchsia: '#EB459E',
                    red: '#ED4245',
                    white: '#FFFFFF',
                    black: '#23272A'
                },
                // 다크 테마 색상
                dark: {
                    bg: '#0a0a0a',
                    card: '#1a1a1a',
                    border: '#36393F'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif']
            }
        },
    },
    plugins: [],
};