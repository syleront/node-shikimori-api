const Api = require("./api");
const Auth = require("./auth");
const CustomUtils = require("./custom-utils");

class Shikimori {
  constructor() {
    this.api = new Api(this);
    this.auth = new Auth(this);
    this.utils = new CustomUtils(this);
  }

  setToken(value) {
    this.api.token = value;
  }
}

module.exports = Shikimori;
