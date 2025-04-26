module.exports = function(eleventyConfig) {
  // Copy static assets and game folder
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("game/");

  // Create a "posts" collection from Markdown files in the posts folder
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "docs"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
}; 