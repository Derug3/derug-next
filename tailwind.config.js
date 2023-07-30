/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        text: "text 5s ease infinite",
      },
      colors: {
        "main-blue": "rgb(9, 194, 246)",
        "green-color": "#2DD4BF",
        "main-dark": "#0d1117;",
        "text-color": "#dcdcdc",
        'from-steel-500': 'rgb(71, 84, 103)',
        'via-blue-800': 'rgb(29, 41, 57)',
        'to-coolGray-900': '#fff'
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
