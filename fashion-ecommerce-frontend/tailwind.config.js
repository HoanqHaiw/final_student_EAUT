/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#111',
                secondary: '#999',
                success: '#4CAF50',
                danger: '#f44336',
                warning: '#ff9800',
                info: '#2196F3',
            },
            fontFamily: {
                sans: ['Jost', 'system-ui', 'sans-serif'],
                heading: ['Cormorant Garamond', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
}
