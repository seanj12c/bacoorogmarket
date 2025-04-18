const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#008080",
          "base-100": "#fffcff",
          error: "#ff0000",
          info: "#DFDEDF",
        },
      },
    ],
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: "#008080",
      secondary: "#0D6410",
      bgray: "#ECECEC",
      post: "#eff0f3",
      black: "#181818",
    },
    extend: {},
  },
  plugins: [require("daisyui")],
});
