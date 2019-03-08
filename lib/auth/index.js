class Auth {
  constructor(shikimori) {
    this.shikimori = shikimori;
  }

  async login(params) {
    if (params.nickname && params.password) {
      return this.shikimori.api.request.get("access_token", params).then((r) => {
        this.shikimori.api.token = r.api_access_token;
        return true;
      });
    } else {
      let not_passed = [];
      if (!params.nickname) not_passed.push("nickname");
      if (!params.password) not_passed.push("password");
      throw `Error! Next params is not passed: ${not_passed.join(", ")}`;
    }
  }
}

module.exports = Auth;