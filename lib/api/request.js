const needle = require("needle");
const querystring = require("querystring");

class Request {
  constructor(api) {
    this.url = "https://shikimori.org/api";
    this.api = api;
  }

  req(path, params = {}, method = "get") {
    if (method == "get" && Object.keys(params).length !== 0) path += `?${querystring.stringify(params)}`;
    let url = `${this.url}${path}`;

    let options = {
      headers: {
        "Authorization": this.api.token ? `Bearer ${this.api.token}` : "",
        "User-Agent": this.api.user_agent || "",
      },
      cookies: this.api.cookies || ""
    };

    let p;
    if (method == "get")
      p = needle(method, url, options);
    else
      p = needle(method, url, params, options);

    return p.then((r) => {
      if (r.statusCode === 401) {
        return this.api.shikimori.auth.refreshToken().then(() => {
          return this.req(path, params, method);
        });
      } else if (r.body) {
        return r.body;
      } else {
        throw { result: null };
      }
    });
  }
}

module.exports = Request;