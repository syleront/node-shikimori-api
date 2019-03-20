const needle = require("needle");
const querystring = require("querystring");

const SourceParser = require("./source-parser");
const decodeXmlEntity = require("./source-parser/parsers/tools/xml-decode");

class Utils {
  constructor(shikimori) {
    this.shikimori = shikimori;
    this.sourceParser = new SourceParser({
      sm: {
        autoRefresh: true
      }
    });
  }

  async search(params = {}) {
    let { query, type, kind } = params;
    if (!query && typeof params === "string") query = params;
    if (!query) {
      throw {
        error: "empty_query"
      };
    } else {
      let p = {
        search: query,
        kind: kind || ""
      };
      let url = `https://shikimori.org/${type || "animes"}/autocomplete/?${querystring.stringify(p)}`;
      let r = await needle("get", url);
      if (r.statusCode === 200) {
        return r.body.reverse().map((e) => {
          return {
            url: "https://shikimori.org" + e.url,
            id: parseIdFromHref(e.url),
            title: e.value
          };
        });
      } else if (r.statusCode === 404) {
        throw {
          error: "page_not_found"
        };
      } else {
        throw {
          error: "unknown_error"
        };
      }
    }
  }

  async listEpisodes(params = {}) {
    let { id } = params;

    if (id) {
      let url = `https://play.shikimori.org/animes/${id}/video_online`;
      let r = await needle("get", url, { follow: 1 });

      if (r.statusCode === 404 && isFake404(r.body)) {
        let url = r.body.match(/<a.+href="(.+?)">.+<\/a>/)[1];
        let id = parseIdFromHref(url);
        return this.listEpisodes({ id });
      } else {
        if (r.statusCode === 200) {
          let list_column = r.body.match(/<div class="c-anime_video_episodes">(.+?)<\/div><\/div>/i);
          if (list_column) {
            return list_column[1].match(/<div class="b-video_variant".+?<\/div>/g).map((e) => {
              let number = e.match(/data-episode="([0-9]+)"/);
              let kinds = e.match(/"episode-kinds">(.+?)</);
              let hostings = e.match(/"episode-hostings">(.+?)</);
              return {
                number: number ? parseInt(number[1]) : null,
                kinds: kinds ? kinds[1].split(/,\s?/) : null,
                hostings: hostings ? hostings[1].split(/,\s?/) : null
              };
            });
          }
        } else {
          throw {
            error: "request_error",
            response: r
          };
        }
      }
    } else {
      throw {
        error: "missed_param",
        message: "missed id parameter"
      };
    }
  }

  async listEpisodeSources(params = {}) {
    let { id, number } = params;

    if (id && number) {
      let url = `https://play.shikimori.org/animes/${id}/video_online/${number}`;
      let r = await needle("get", url, { follow: 1 });

      if (r.statusCode === 404 && isFake404(r.body)) {
        let url = r.body.match(/<a.+href="(.+?)">.+<\/a>/)[1];
        let id = parseIdFromHref(url);
        return this.listEpisodeSources({ id, number });
      } else {
        if (r.statusCode === 200) {
          let groups = r.body.match(/<div class="video-variant-group".+?<\/div><\/div>/g);
          if (groups) {
            let list = groups.map((group) => {
              let kind = group.match(/data-kind="(.+?)"/)[1];
              let variants = group.match(/<div class="b-video_variant.+?<\/div>/g);
              let items = variants.map((e) => {
                let author = e.match(/<span class="video-author">(.+?)<\/span>/);
                let video_id = e.match(/data-video_id="(.+?)"/);
                let hosting = e.match(/<span class="video-hosting">(.+?)<\/span>/);
                let is_bluray = /<span class="video-quality bd"><\/span>/.test(e);

                return {
                  author: author ? decodeXmlEntity(author[1]) : null,
                  video_id: video_id ? parseInt(video_id[1]) : null,
                  hosting: hosting ? hosting[1] : null,
                  is_bluray
                };
              });

              return {
                type: kind,
                items
              };
            });

            return list;
          } else {
            throw {
              error: "parsing_error",
              message: "video groups is not defined at page"
            };
          }
        } else {
          throw {
            error: "request_error",
            response: r
          };
        }
      }
    } else {
      throw {
        error: "missed_param",
        message: "missed id/number parameter"
      };
    }
  }

  async parseIframeLink(params = {}) {
    let { id, number, video_id } = params;

    if (id && number && video_id) {
      let url = `https://play.shikimori.org/animes/${id}/video_online/${number}/${video_id}`;
      let r = await needle("get", url, { follow: 1 });

      if (r.statusCode === 404 && isFake404(r.body)) {
        let url = r.body.match(/<a.+href="(.+?)">.+<\/a>/)[1];
        let id = parseIdFromHref(url);
        return this.parseIframeLink({ id, number, video_id });
      } else {
        let iframe = r.body.match(/<iframe.+?<\/iframe>/);
        if (iframe) {
          let url = decodeXmlEntity(iframe[0].match(/src="(.+?)"/)[1]);
          if (!/^http/.test(url)) url = `https:${url}`;
          return url;
        } else {
          throw {
            error: "parsing_error",
            message: "iframe is not defined at page"
          };
        }
      }
    } else {
      throw {
        error: "missed_param",
        message: "missed id/number/video_id parameter"
      };
    }
  }

  async getIframeSources(url) {
    return this.sourceParser.getSources(url);
  }

  markHistory(obj) {
    let now = Date.now();
    return obj.map((e) => {
      let calculated = (now - new Date(e.created_at)) / 1000;
      let seconds_today = getSecondsToday();
      if (calculated < seconds_today) e.day_mark = "today";
      else if (calculated >= seconds_today && calculated < seconds_today + 86400) e.day_mark = "yesterday";
      else if (calculated >= seconds_today + 86400 && calculated < seconds_today + 86400 * 6) e.day_mark = "weekly";
      else e.day_mark = "other";
      return e;
    }).map((e) => {
      if (e.day_mark === "today") e.day_mark_ru = "Сегодня";
      else if (e.day_mark === "yesterday") e.day_mark_ru = "Вчера";
      else if (e.day_mark === "weekly") e.day_mark_ru = "В течение недели";
      else e.day_mark_ru = "Больше недели назад";
      return e;
    });
  }
}

function parseIdFromHref(string) {
  if (/animes\/([A-z0-9]+)/.test(string)) {
    let match = string.match(/animes\/([A-z0-9]+)/i);
    return match[1];
  } else {
    return null;
  }
}

function isFake404(body) {
  return typeof body === "string" && /<p class="error-404">302<\/p>/.test(body);
}

function getSecondsToday() {
  let d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

module.exports = Utils;