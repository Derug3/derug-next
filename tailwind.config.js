/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        text: "text 5s ease infinite",
        scale: "scale 0.5s ease-in-out",
      },
      colors: {
        "main-blue": "rgb(9, 194, 246)",
        "green-color": "#3CCB7F",
        "main-dark": "#101828;",
        "text-color": "#dcdcdc",
        'from-steel-500': 'rgb(71, 84, 103)',
        'via-blue-800': 'rgb(29, 41, 57)',
        'to-coolGray-900': '#fff',
        'active': '#36BFFA',
      },
      dropShadow: {
        "2xl": "white 0px 0px 10px",
        "3xl": "0 35px 35px rgba(0, 0, 0, 0.25)",
        "4xl": [
          "0 35px 35px rgba(0, 0, 0, 0.25)",
          "0 45px 65px rgba(0, 0, 0, 0.15)",
        ],
      },
      keyframes: {
        scale: {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '100%': {  transform: 'scale(1)', opacity: 1},
        },
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [],
};
