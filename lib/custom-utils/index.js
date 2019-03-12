const needle = require("needle");
const querystring = require("querystring");

class Utils {
  async search(params = {}) {
    let { query, type, kind } = params;
    if (!query && typeof params == "string") query = params;
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
      if (e.day_mark == "today") e.day_mark_ru = "Сегодня";
      else if (e.day_mark == "yesterday") e.day_mark_ru = "Вчера";
      else if (e.day_mark == "weekly") e.day_mark_ru = "В течение недели";
      else e.day_mark_ru = "Больше недели назад";
      return e;
    });
  }
}

function parseIdFromHref(string) {
  if (/\/[0-9]/.test(string)) {
    let match = string.match(/\/([0-9]+)/i);
    return match[1];
  } else {
    return null;
  }
}

function getSecondsToday() {
  let d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

module.exports = Utils;