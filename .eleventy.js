const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/img/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Multi-line CMS text -> <br>-separated lines
  eleventyConfig.addFilter("nl2br", (s) => String(s || "").trim().replace(/\n/g, "<br>"));

  // Wrap the first occurrence of `word` in <em> (the orange hero highlight)
  eleventyConfig.addFilter("highlight", (s, word) => {
    s = String(s || "");
    if (!word || s.indexOf(word) === -1) return s;
    return s.replace(word, "<em>" + word + "</em>");
  });

  // JSON safe to drop inside <script type="application/json"> (no </script> break-out)
  eleventyConfig.addFilter("jsonScript", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));

  // Years since a founding year, computed at build time (the counter rolls up to it)
  eleventyConfig.addFilter("yearsSince", (year) => new Date().getFullYear() - parseInt(year, 10));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
