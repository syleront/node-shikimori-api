const needle = require("needle");

const default_params = {
  user_agent: "node-shikimori-api"
};

class Auth {
  constructor(shikimori) {
    this.shikimori = shikimori;
    this.shikimori.api.user_agent = default_params.user_agent;
  }

  async login(params) {
    if (params.nickname && params.password) {
      let options = {
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0"
      };
      return needle("get", "https://shikimori.org/users/sign_in", options).then((r) => {
        options.cookies = Object.assign(options.cookies || {}, r.cookies);
        return r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
      }).then((token) => {
        return needle("post", "https://shikimori.org/users/sign_in", {
          utf8: "✓",
          user: {
            nickname: params.nickname,
            password: params.password
          },
          authenticity_token: token
        }, options).then((r) => {
          if (r.statusCode !== 302) throw "Incorrect nickname or password";
          options.cookies = Object.assign(options.cookies, r.cookies);
          return true;
        });
      }).then(() => {
        return needle("get", "https://shikimori.org/oauth/authorize?client_id=d798405b0f4d7170471d67d4048a3e4b6fed4a3f0640745934b0e1b18fff6d02&redirect_uri=https%3A%2F%2Fblank.html&response_type=code", options).then((r) => {
          options.cookies = Object.assign(options.cookies, r.cookies);
          if (r.statusCode == 200) {
            let token = r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
            return needle("post", "https://shikimori.org/oauth/authorize", {
              utf8: "✓",
              authenticity_token: token,
              client_id: "d798405b0f4d7170471d67d4048a3e4b6fed4a3f0640745934b0e1b18fff6d02",
              redirect_uri: "https://blank.html",
              state: "",
              response_type: "code",
              scope: "",
              commit: "Разрешить"
            }, Object.assign(options, {
              origin: "https://shikimori.org",
              referer: "https://shikimori.org/oauth/authorize?client_id=d798405b0f4d7170471d67d4048a3e4b6fed4a3f0640745934b0e1b18fff6d02&redirect_uri=https://blank.html&response_type=code",
              "upgrade-insecure-requests": 1
            })).then((r) => r.headers.location.match(/code=(.+)/)[1]);
          } else {
            return r.headers.location.match(/code=(.+)/)[1];
          }
        });
      }).then((code) => {
        return needle("post", "https://shikimori.org/oauth/token", {
          grant_type: "authorization_code",
          client_id: "d798405b0f4d7170471d67d4048a3e4b6fed4a3f0640745934b0e1b18fff6d02",
          client_secret: "bad6e767ab8624c698bc9d0bfb8f1c06370c09e2f255cccb70ef81f23d350e91",
          code: code,
          redirect_uri: "https://blank.html"
        }, {
            "User-Agent": default_params.user_agent
          }).then((r) => {
            this.shikimori.api.token = r.body.access_token;
            return r.body;
          });
      }).catch((e) => {
        throw e;
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