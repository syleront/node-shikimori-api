const Api = require("./api");
const Auth = require("./auth");

class Shikimori {
  constructor() {
    this.api = new Api(this);
    this.auth = new Auth(this);
  }

  setToken(value) {
    this.api.token = value;
  }
}

module.exports = Shikimori;