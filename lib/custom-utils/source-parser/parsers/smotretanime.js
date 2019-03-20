const needle = require("needle");

const parseNodeParams = require("./tools/node-parser");
const decodeXmlEntity = require("./tools/xml-decode");
const asyncSleep = require("./tools/async-sleep");
const headers = require("./tools/default-headers.json");

class Smotretanime {
  constructor(params = {}) {
    if (params.autoRefresh) {
      this.autoRefresh = true;
      this.cookies = null;
      this.interval = null;
    }
  }

  async getSources(url) {
    let main_url = checkAndFixUrl(url);
    if (!main_url) {
      throw {
        error: "invalid_url"
      };
    } else {
      let r = await needle("get", main_url, { follow: 5, cookies: this.cookies || null, headers });
      if (r.statusCode === 200) {
        let video = parseVideoData(r.body.match(/<video.+?>/)[0]);
        let scripts = r.body.match(/<script.+?>/g).map(parseNodeParams).filter((e) => e.id && e.src && /^data/i.test(e.src));
        if (scripts.length) {
          let string = scripts[0].src.replace(/data:text\/javascript;base64,/, "");
          let decoded = Buffer.from(string, "base64").toString();
          let activation_code = decoded.match(/activateCodeTmp\s=\s"([A-z0-9]+)"/i);
          if (activation_code) {
            let ctx = this;
            let url = "https://smotretanime.ru/translations/embedActivation?code=" + activation_code[1];
            await asyncSleep(14000);
            let get = async (url) => {
              let r = await needle("get", url, { headers });
              if (r.statusCode === 200) {
                let res = JSON.parse(r.body);
                if (res.error) {
                  await asyncSleep(1000);
                  return get(url);
                } else {
                  if (ctx.autoRefresh && !ctx.interval) {
                    ctx.cookies = {};
                    ctx.cookies.watchedPromoVideo = res.cookieValue;
                    ctx.interval = setInterval(() => {
                      ctx.getSources(main_url);
                    }, 5 * 60 * 1000);
                  }
                  if (res.sources) video.sources = JSON.parse(res.sources);
                  return fixSources(video);
                }
              } else {
                throw {
                  error: "request_error",
                  response: r
                };
              }
            };
            return get(url);
          } else {
            throw {
              message: "activation code is not found"
            };
          }
        } else {
          return fixSources(video);
        }
      } else {
        throw {
          error: "request_error",
          response: r
        };
      }
    }
  }
}

function parseVideoData(elem) {
  let params = parseNodeParams(elem);
  Object.keys(params).forEach((e) => {
    let decoded = decodeXmlEntity(params[e]);
    if (/\[(.+?|)\]/.test(decoded)) {
      params[e] = JSON.parse(decoded);
    } else {
      params[e] = decoded;
    }
  });
  return params;
}

function fixSources(obj) {
  return obj.sources.map((e) => {
    if (e.urls.length === 1) e.urls = e.urls[0];
    return e;
  });
}

function checkAndFixUrl(url) {
  if (/smotretanime\.ru/.test(url)) {
    if (/\/embed/.test(url)) {
      return url;
    } else {
      let matched = url.match(/[0-9]+$/);
      if (matched) {
        return "https://smotretanime.ru/translations/embed/" + matched[0];
      } else {
        return null;
      }
    }
  } else {
    return null;
  }
}

module.exports = Smotretanime;