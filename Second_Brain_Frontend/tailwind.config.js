/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // If you're using React (TS or JS)
  ],
  theme: {
    extend: {
      color: {
        gray: {
          200: "#F8FAFA"
        },  
        purple: {
          300: "#EEF3FE",
          500: "#E1E8FF",
          600: "#4E45E6",
        },
      },
    },
  },
  plugins: [],
};
