const needle = require("needle");

const headers = require("./tools/default-headers.json");

class Vk {
  async getSources(url) {
    let r = await needle("get", url, { headers });
    if (r.statusCode === 200) {
      let params = r.body.match(/playerParams\s?=\s?({.+?});/);
      if (params) {
        let json = JSON.parse(params[1]);
        return json;
      } else {
        throw {
          error: "parsing_error",
          message: "params is not defined"
        };
      }
    } else {
      throw {
        error: "request_error",
        response: r
      };
    }
  }
}

module.exports = Vk;