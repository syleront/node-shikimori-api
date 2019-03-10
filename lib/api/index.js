const Request = require("./request");
const CustomUtils = require("./custom-utils");

const methods = require("./methods");

class API {
  constructor(shikimori) {
    this.token = null;
    this.user_agent = null;

    this.request = new Request(this);
    this.utils = new CustomUtils(this);

    this.shikimori = shikimori;

    methods.forEach((method) => {
      this[method] = (params) => {
        let f = makePathFromParams(method, params);
        return this.request[params.method ? params.method.toLowerCase() : "get"](f.path, f.params);
      };
    });
  }
}

function makePathFromParams(method, params) {
  let path = method;
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

module.exports = API;