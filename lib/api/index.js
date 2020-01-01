const Request = require("./request");
const methods = require("./methods");

class API {
  constructor(shikimori) {
    this.shikimori = shikimori;

    this.token = null;
    this.refresh_token = null;
    this.user_agent = null;

    this.request = new Request(this);

    methods.forEach((method) => {
      const { _makePathFromParams } = this;

      this[method] = (params) => {
        let f = _makePathFromParams(method, params);
        return this.request.req(f.path, f.params, params.method ? params.method.toLowerCase() : "get");
      };
    });
  }

  _makePathFromParams(method, params) {
    let path = "";
    if (params.v) {
      path += "/v2";
    }

    path += `/${method}`;
    params = Object.assign({}, params);

    if (params.user_id) {
      path += `/${params.user_id}`;
      delete params.user_id;
    } else if (params.anime_id) {
      path += `/${params.anime_id}`;
      delete params.anime_id;
    }

    if (params.section) {
      path += `/${params.section}`;
      delete params.section;
    }

    delete params.method;

    return { path, params };
  }
}

module.exports = API;
