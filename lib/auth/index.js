const needle = require("needle");

const app_params = {
  user_agent: "node-shikimori-api",
  client_id: "d798405b0f4d7170471d67d4048a3e4b6fed4a3f0640745934b0e1b18fff6d02",
  client_secret: "bad6e767ab8624c698bc9d0bfb8f1c06370c09e2f255cccb70ef81f23d350e91",
  redirect_uri: "https://blank.html"
};

const request_options = {
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0"
};

class Auth {
  constructor(shikimori) {
    this.shikimori = shikimori;
    this.shikimori.api.user_agent = app_params.user_agent;
    this.relogin = null;
  }

  async login(params) {
    let { nickname, password } = params;
    if (nickname && password) {
      this.relogin = this.login.bind(this, { nickname, password });
      return needle("get", "https://shikimori.org/users/sign_in", request_options).then((r) => {
        request_options.cookies = Object.assign(request_options.cookies || {}, r.cookies);
        return r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
      }).then((token) => {
        return needle("post", "https://shikimori.org/users/sign_in", {
          utf8: "✓",
          user: {
            nickname: nickname,
            password: password
          },
          authenticity_token: token
        }, request_options).then((r) => {
          if (r.statusCode !== 302) throw "Incorrect nickname or password";
          request_options.cookies = Object.assign(request_options.cookies, r.cookies);
          return true;
        });
      }).then(() => {
        return needle("get", `https://shikimori.org/oauth/authorize?client_id=${app_params.client_id}&redirect_uri=${encodeURIComponent(app_params.redirect_uri)}&response_type=code`, request_options).then((r) => {
          request_options.cookies = Object.assign(request_options.cookies, r.cookies);
          if (r.statusCode === 200) {
            let token = r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
            return needle("post", "https://shikimori.org/oauth/authorize", {
              utf8: "✓",
              authenticity_token: token,
              client_id: app_params.client_id,
              redirect_uri: "https://blank.html",
              state: "",
              response_type: "code",
              scope: "",
              commit: "Разрешить"
            }, Object.assign(request_options, {
              origin: "https://shikimori.org",
              referer: `https://shikimori.org/oauth/authorize?client_id=${app_params.client_id}&redirect_uri=${app_params.redirect_uri}&response_type=code`,
              "upgrade-insecure-requests": 1
            })).then((r) => r.headers.location.match(/code=(.+)/)[1]);
          } else {
            return r.headers.location.match(/code=(.+)/)[1];
          }
        });
      }).then((code) => {
        return needle("post", "https://shikimori.org/oauth/token", {
          grant_type: "authorization_code",
          client_id: app_params.client_id,
          client_secret: app_params.client_secret,
          code: code,
          redirect_uri: "https://blank.html"
        }, {
            headers: {
              "User-Agent": app_params.user_agent
            }
          }).then((r) => {
            request_options.cookies = {};
            this.shikimori.api.token = r.body.access_token;
            this.shikimori.api.refresh_token = r.body.refresh_token;
            return r.body;
          });
      }).catch((e) => {
        throw e;
      });
    } else {
      let not_passed = [];
      if (!nickname) not_passed.push("nickname");
      if (!password) not_passed.push("password");
      throw `Error! Next params is not passed: ${not_passed.join(", ")}`;
    }
  }

  async refreshToken() {
    let { refresh_token } = this.shikimori.api;
    if (refresh_token) {
      return needle("post", "https://shikimori.org/oauth/token", {
        grant_type: "refresh_token",
        client_id: app_params.client_id,
        client_secret: app_params.client_secret,
        refresh_token: refresh_token
      }, {
          headers: {
            "User-Agent": app_params.user_agent
          }
        }).then((r) => {
          if (r.statusCode === 401) {
            if (this.relogin) {
              return this.relogin();
            } else {
              throw "your access_token is out of date, please login again";
            }
          } else {
            this.shikimori.api.token = r.body.access_token;
            this.shikimori.api.refresh_token = r.body.refresh_token;
            return r.body;
          }
        });
    } else {
      throw "refresh token is undefined";
    }
  }
}

module.exports = Auth;