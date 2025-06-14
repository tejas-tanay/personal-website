module.exports = function(eleventyConfig) {
  // Copy static assets and game folder
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("game/");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Get the current year for the footer
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Add date filter
  eleventyConfig.addFilter("date", (dateObj, format) => {
    const date = new Date(dateObj);
    if (format === 'YYYY-MM-DD') {
      return date.toISOString().split('T')[0];
    } else if (format === 'MMMM DD, YYYY') {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return date.toDateString();
  });

  // Create a "posts" collection from Markdown files in the posts folder
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
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