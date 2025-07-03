module.exports = function(eleventyConfig) {
  // Copy essentials
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Utilities
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  const pad = n => n.toString().padStart(2, "0");
  eleventyConfig.addFilter("date", (dateObj, format) => {
    const date = new Date(dateObj);
    if (format === "YYYY-MM-DD") {
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
    }
    if (format === "MMMM DD, YYYY") {
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
    if (format === "ddd, DD MMM YYYY HH:mm:ss ZZ") {
      return date.toUTCString();
    }
    return date.toDateString();
  });

  // Posts collection
  eleventyConfig.addCollection("posts", collection =>
    collection.getFilteredByGlob("posts/**/*.md").sort((a, b) => b.date - a.date)
  );

  // Computed permalink: /YYYY/mm/dd/slug/
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: data => {
      if (data.page && data.page.inputPath && data.page.inputPath.startsWith("./posts/")) {
        const d = new Date(data.date);
        const yyyy = d.getUTCFullYear();
        const mm = pad(d.getUTCMonth() + 1);
        const dd = pad(d.getUTCDate());
        const slug = data.page.fileSlug.replace(/^posts\//, "");
        return `/${yyyy}/${mm}/${dd}/${slug}/`;
      }
      return data.permalink;
    }
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "docs" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
}; 