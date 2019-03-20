module.exports = (string) => {
  let params = string.match(/[A-z]+=(?:""|".+?")/g);
  let obj = {};
  params.forEach((e) => {
    let p = e.split("=\"");
    obj[p[0]] = p[1].replace(/"$/, "");
  });
  return obj;
};