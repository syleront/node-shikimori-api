const needle = require("needle");
const querystring = require("querystring");

class Request {
  constructor(api) {
    this.url = "https://shikimori.org/api";
    this.api = api;
  }

  async req(path, params = {}, method = "get") {
    if (method === "get" && Object.keys(params).length !== 0) path += `?${querystring.stringify(params)}`;
    let url = `${this.url}${path}`;

    let options = {
      headers: {
        "Authorization": this.api.token ? `Bearer ${this.api.token}` : "",
        "User-Agent": this.api.user_agent || "",
      },
      cookies: this.api.cookies || ""
    };

    let r;
    if (method === "get")
      r = await needle(method, url, options);
    else
      r = await needle(method, url, params, options);

    if (r.statusCode === 401) {
      await this.api.shikimori.auth.refreshToken();
      return this.req(path, params, method);
    } else if (r.body) {
      return r.body;
    } else {
      throw { result: null };
    }
  }
}

module.exports = Request;