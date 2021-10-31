module.exports = (eleventyConfig ) => {
  eleventyConfig.setDataDeepMerge(true);

  return {
    dir: {
      input: "src",
      output: "www",
    }
  };
};
