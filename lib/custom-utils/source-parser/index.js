const Sibnet = require("./parsers/sibnet");
const Sm = require("./parsers/smotretanime");
const Vk = require("./parsers/vk");

class SourceParser {
  constructor(params = {}) {
    this.sibnet = new Sibnet(params.sibnet);
    this.sm = new Sm(params.sm);
    this.vk = new Vk(params.vk);
  }

  async getSources(url) {
    if (typeof url !== "string") {
      throw {
        error: "invalid_parameter",
        message: "url must be a string"
      };
    } else {
      if (/vk\.com/i.test(url)) {
        let r = await this.vk.getSources(url);
        if (r.params && r.params[0]) {
          let subtitles = null;
          let title = r.params[0].md_title;
          let sources = Object.entries(r.params[0]).filter((e) => /url[0-9]+/.test(e[0])).map((e) => {
            return {
              is_divided: false,
              quality: e[0].match(/[0-9]+/)[0],
              url: e[1]
            };
          });
          return { sources, title, subtitles };
        }
      } else if (/smotretanime\.ru/.test(url)) {
        let r = await this.sm.getSources(url);
        if (r.sources) {
          let { title } = r;
          let subtitles = r.subtitles ? {
            url: r.subtitles,
            fonts: r.fonts
          } : null;
          let sources = r.sources.map((e) => {
            return {
              is_divided: typeof e.urls === "object",
              quality: e.height,
              url: e.urls
            };
          });

          return { sources, subtitles, title };
        }
      } else if (/sibnet\.ru/.test(url)) {
        let r = await this.sibnet.getSources(url);
        return {
          sources: [{
            is_divided: false,
            quality: null,
            url: r.url
          }],
          title: r.title,
          headers: r.headers || null,
          subtitles: null
        };
      } else {
        throw {
          error: "parsing_error",
          message: "this hosting is not supported"
        };
      }
    }
  }
}

module.exports = SourceParser;