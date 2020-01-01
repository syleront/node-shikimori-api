const needle = require("needle");
const querystring = require("querystring");

const { MAIN_URL } = require("../constants");

class Utils {
  constructor(shikimori) {
    this.shikimori = shikimori;
  }

  async search({ query, type, kind } = {}) {
    if (!query) {
      throw {
        error: "empty_query"
      };
    } else {
      let p = {
        search: query,
        kind: kind || ""
      };

      let url = `${MAIN_URL}/${type || "animes"}/autocomplete/?${querystring.stringify(p)}`;
      let r = await needle("get", url);

      if (r.statusCode === 200) {
        return r.body.reverse().map((e) => {
          return {
            url: `${MAIN_URL}${e.url}`,
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

  async getTitleAwards(id) {
    let r = await needle("get", `${MAIN_URL}/animes/${id}`, { follow: 1 }); //<div.+?"winner">(.+?)<\/div>

    if (r.statusCode === 200) {
      let winners = r.body.match(/<div.+?"winners">(.+?<\/div>)<\/div>/);

      if (winners !== null) {
        let awards = winners[1].match(/<div.+?"winner">(.+?)<\/div>/g).map((e) => e.match(/<div.+?"winner">(.+?)<\/a><\/div>/)[1].replace(/<.+?>/, ""));
        return awards;
      } else {
        return null;
      }
    } else if (r.statusCode === 404 && isFake404(r.body)) {
      let url = r.body.match(/<a.+href="(.+?)">.+<\/a>/)[1];
      let id = parseIdFromHref(url);
      return this.getTitleAwards(id);
    } else {
      throw {
        error: "request_error",
        response: r
      };
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
      if (e.day_mark === "today") e.day_mark_ru = "Сегодня";
      else if (e.day_mark === "yesterday") e.day_mark_ru = "Вчера";
      else if (e.day_mark === "weekly") e.day_mark_ru = "В течение недели";
      else e.day_mark_ru = "Больше недели назад";
      return e;
    });
  }

  groupHistoryByMarks(array) {
    return Object.entries(array.reduce((h, obj) => Object.assign(h, { [obj.day_mark]: (h[obj.day_mark] || []).concat(obj) }), {}));
  }
}

function isFake404(body) {
  return typeof body === "string" && /<p class="error-404">302<\/p>/.test(body);
}

function parseIdFromHref(string) {
  if (/animes\/([A-z0-9]+)/.test(string)) {
    let match = string.match(/animes\/([A-z0-9]+)/i);
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
