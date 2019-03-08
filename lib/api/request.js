const fetch = require("node-fetch");
const querystring = require("querystring");

class Request {
  constructor(api) {
    this.url = "https://shikimori.org/api/";
    this.api = api;
  }

  get(path, params = {}) {
    if (Object.keys(params).length !== 0) path += `?${querystring.stringify(params)}`;
    let url = new URL(path, this.url);
    return fetch(url, {
      headers: {
        'X-User-Api-Access-Token': this.api.token || ""
      }
    }).then((r) => {
      return r.json()
    });
  }

  post(path, params = {}) {
    let url = new URL(path, this.url);
    return fetch(url, {
      method: "POST",
      headers: {
        'X-User-Api-Access-Token': this.api.token || ""
      },
      body: params
    }).then((r) => {
      return r.json()
    });
  }
}

module.exports = Request;