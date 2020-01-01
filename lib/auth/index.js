const needle = require("needle");

const app_params = require("./app-params");
const request_options = require("./request-options");

const { MAIN_URL } = require("../constants");

class Auth {
  constructor(shikimori) {
    this.shikimori = shikimori;
    this.shikimori.api.user_agent = app_params.user_agent;
    this.relogin = null;
  }

  async login({ nickname, password } = {}) {
    if (nickname && password) {
      return needle("get", `${MAIN_URL}/users/sign_in`, request_options).then((r) => {
        request_options.cookies = Object.assign(request_options.cookies || {}, r.cookies);
        return r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
      }).then((token) => {
        return needle("post", `${MAIN_URL}/users/sign_in`, {
          utf8: "✓",
          user: {
            nickname: nickname,
            password: password
          },
          authenticity_token: token
        }, request_options).then((r) => {
          if (r.statusCode !== 302) throw { error: "auth_failed" };
          request_options.cookies = Object.assign(request_options.cookies, r.cookies);
          return true;
        });
      }).then(() => {
        return needle("get", `${MAIN_URL}/oauth/authorize?client_id=${app_params.client_id}&redirect_uri=${encodeURIComponent(app_params.redirect_uri)}&response_type=code`, request_options).then((r) => {
          request_options.cookies = Object.assign(request_options.cookies, r.cookies);
          if (r.statusCode === 200) {
            let token = r.body.match(/"authenticity_token"\svalue="(.+?)"/)[1];
            return needle("post", `${MAIN_URL}/oauth/authorize`, {
              utf8: "✓",
              authenticity_token: token,
              client_id: app_params.client_id,
              redirect_uri: "https://blank.html",
              state: "",
              response_type: "code",
              scope: "",
              commit: "Разрешить"
            }, Object.assign(request_options, {
              origin: MAIN_URL,
              referer: `${MAIN_URL}/oauth/authorize?client_id=${app_params.client_id}&redirect_uri=${app_params.redirect_uri}&response_type=code`,
              "upgrade-insecure-requests": 1
            })).then((r) => r.headers.location.match(/code=(.+)/)[1]);
          } else {
            return r.headers.location.match(/code=(.+)/)[1];
          }
        });
      }).then((code) => {
        return needle("post", `${MAIN_URL}/oauth/token`, {
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
          delete request_options.cookies.request_method;
          this.shikimori.api.cookies = request_options.cookies;
          this.shikimori.api.token = r.body.access_token;
          this.shikimori.api.refresh_token = r.body.refresh_token;
          this.relogin = this.login.bind(this, { nickname, password });
          request_options.cookies = {};
          return r.body;
        });
      }).catch((e) => {
        throw e;
      });
    } else {
      let not_passed = [];
      if (!nickname) not_passed.push("nickname");
      if (!password) not_passed.push("password");
      throw {
        error: "missed_params",
        missed: not_passed.join(", ")
      };
    }
  }

  async refreshToken() {
    let { refresh_token } = this.shikimori.api;

    if (refresh_token) {
      return needle("post", `${MAIN_URL}/oauth/token`, {
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
            throw {
              error: "missed_access_token",
              message: "your access_token is outdated, please login again"
            };
          }
        } else {
          this.shikimori.api.token = r.body.access_token;
          this.shikimori.api.refresh_token = r.body.refresh_token;
          return r.body;
        }
      });
    } else if (this.relogin) {
      return this.relogin();
    } else {
      throw {
        error: "auth_error",
        message: "you are not logged in"
      };
    }
  }
}

module.exports = Auth;
