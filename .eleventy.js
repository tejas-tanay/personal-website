module.exports = function(eleventyConfig) {
  // Copy static assets and game folder
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("game/");
  eleventyConfig.addPassthroughCopy("assets");

  // Create a "posts" collection from Markdown files in the posts folder
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  // Create a "projects" collection from Markdown files in the projects folder
  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("projects/*.md");
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