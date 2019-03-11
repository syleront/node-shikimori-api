const needle = require("needle");

class Utils {
  async search(query) {
    if (!query) {
      throw "query is empty";
    } else {
      let url = `https://shikimori.org/animes/autocomplete/?search=${encodeURIComponent(query)}`;
      let list = await needle("get", url).then((r) => r.body);
      return list.reverse().map((e) => {
        return {
          url: "https://shikimori.org" + e.url,
          id: parseIdFromHref(e.url),
          title: e.value
        };
      });
    }
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

module.exports = Utils;