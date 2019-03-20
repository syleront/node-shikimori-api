// source: https://github.com/mdevils/node-html-entities/blob/master/lib/xml-entities.js

let ALPHA_INDEX = {
  "&lt": "<",
  "&gt": ">",
  "&quot": "\"",
  "&apos": "\"",
  "&amp": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&apos;": "\"",
  "&amp;": "&"
};

module.exports = (str) => {
  if (!str || !str.length) {
    return "";
  }
  return str.replace(/&#?[0-9a-zA-Z]+;?/g, (s) => {
    if (s.charAt(1) === "#") {
      let code = s.charAt(2).toLowerCase() === "x" ?
        parseInt(s.substr(3), 16) :
        parseInt(s.substr(2));

      if (isNaN(code) || code < -32768 || code > 65535) {
        return "";
      }
      return String.fromCharCode(code);
    }
    return ALPHA_INDEX[s] || s;
  });
};