const needle = require("needle");
const querystring = require("querystring");

class Request {
  constructor(api) {
    this.url = "https://shikimori.org/api/";
    this.api = api;
  }

  get(path, params = {}) {
    if (Object.keys(params).length !== 0) path += `?${querystring.stringify(params)}`;
    let url = new URL(path, this.url);
    return needle("get", url.href, {
      headers: {
        "Authorization": this.api.token ? `Bearer ${this.api.token}` : "",
        "User-Agent": this.api.user_agent || ""
      }
    }).then((r) => r.body);
  }

  post(path, params = {}) {
    let url = new URL(path, this.url);
    return needle("post", url.href, params, {
      headers: {
        "Authorization": this.api.token ? `Bearer ${this.api.token}` : "",
        "User-Agent": this.api.user_agent || ""
      }
    }).then((r) => r.body);
  }
}

module.exports = Request;