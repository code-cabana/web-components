module.exports = {
  files: ["es", "iife", "umd"].map((format) => {
    return {
      path: `dist/${format}/*.js`,
      maxSize: "20kB",
      compression: "none",
    };
  }),
};
