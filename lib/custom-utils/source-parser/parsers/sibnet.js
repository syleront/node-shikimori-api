const needle = require("needle");

const parseNodePrams = require("./tools/node-parser");
const headers = require("./tools/default-headers.json");

class Sibnet {
  async getSources(url) {
    url = checkAndFixUrl(url);
    if (!url) {
      throw {
        error: "invalid_url"
      };
    } else {
      let r = await needle("get", url, { headers });
      if (r.statusCode === 200) {
        let title;
        let meta_title = r.body.match(/<meta property="og:title".+?>/);
        if (meta_title) title = parseNodePrams(meta_title[0]).content;

        let matched = r.body.match(/player\.src\(\[\{src:\s?"(.+?)"/);
        if (matched) {
          let video_url = "https://video.sibnet.ru" + matched[1];
          let opts = {
            headers: {
              Referer: url,
              "User-Agent": headers["User-Agent"]
            }
          };

          let get = async (url) => {
            let r = await needle("get", url, opts);
            if (r.statusCode === 302) {
              let new_url = r.headers.location;
              if (!/^http/i.test(new_url)) new_url = `https:${new_url}`;
              return get(new_url);
            } else if (r.statusCode === 200) {
              let { headers } = opts;
              return { url, title, headers };
            } else {
              throw {
                error: "request_error",
                response: r
              };
            }
          };

          return get(video_url);
        } else {
          throw {
            error: "parsing_error",
            message: "src is not defined"
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
}

function checkAndFixUrl(url) {
  if (/sibnet\.ru/i.test(url)) {
    if (/^http:/i.test(url)) url = url.replace(/^http:/i, "https:");
    if (!/shell\.php/i.test(url)) {
      let video_id = url.match(/(?:video\.sibnet\.ru\/video|shell\.php\/videoid=)([0-9]+)/i);
      if (video_id) {
        return "https://video.sibnet.ru/shell.php?videoid=" + video_id[1];
      } else {
        return false;
      }
    } else {
      return url;
    }
  } else {
    return null;
  }
}

module.exports = Sibnet;