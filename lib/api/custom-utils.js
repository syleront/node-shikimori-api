const needle = require("needle");

class Utils {
  constructor(api) {
    this.api = api; // for TODO auth
  }

  async search(query) {
    if (!query) {
      throw "query is empty";
    } else {
      let url = "https://shikimori.org/animes/autocomplete/?search=" + encodeURIComponent(query);
      let list = await needle("get", url).then((r) => r.body);
      return list.reverse().map((e) => {
        return {
          url: "https://shikimori.org" + e.url,
          title: e.value
        };
      });
    }
  }
}

module.exports = Utils;