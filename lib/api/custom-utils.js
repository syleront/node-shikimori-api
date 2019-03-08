const fetch = require("node-fetch");

class ApiUtils {
  constructor(api) {
    this.api = api; // for TODO auth
  }

  async search(query) {
    if (!query) {
      throw "query is empty";
    } else {
      let url = "https://shikimori.org/animes/autocomplete/?search=" + encodeURIComponent(query);
      let list = await fetch(url).then((r) => r.json());
      return list.reverse().map((e) => {
        return {
          url: "https://shikimori.org" + e.url,
          title: e.value
        };
      });
    }
  }
}

module.exports = ApiUtils;