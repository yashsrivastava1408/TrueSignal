/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                zomato: {
                    DEFAULT: '#E23744',
                    hover: '#CB2432',
                    light: '#F5ECEC',
                },
                darkBG: '#0D0D10',
                panelBG: '#16161A',
                panelBorder: '#292930',
                accentText: '#A1A1AA',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
