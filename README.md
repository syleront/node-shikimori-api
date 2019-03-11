# node-shikimori-api - Why? Because.
• [Документация на русском](https://github.com/syleront/node-shikimori-api/blob/master/README-RU.md)
## Installing
Using npm
```cmd
npm i node-shikimori-api
```
Using yarn
```cmd
yarn add node-shikimori-api
```

## Common Usage

### Basics:
```js
const Shikimori = require("node-shikimori-api");
const shiki = new Shikimori();

shiki.api.users({ // request to https://shikimori.org/api/users/Syleront
  user_id: "Syleront"
}).then((res) => {
  // some code
});
```

### Authorizing with OAuth2
```js
const Shikimori = require("node-shikimori-api");
const shiki = new Shikimori();

shiki.auth.login({
  nickname: "zerotwo",
  password: "qwerty123"
}).then(() => {
  shiki.api.users({ // request to https://shikimori.org/api/users/whoami
    section: "whoami"
  }).then((res) => {
    // returns logged user info
  });
}).catch((err) => {
  // handle errors
});
```

### Address paths
Shikimori users some parameters in url paths (e.g. user id)
How to get them? e.g. if you wanna to get ../api/users/zerotwo/history (https://shikimori.org/api/doc/1.0/users/history)
You must to do this next:

``` js
shiki.api.users({
  section: "history",
  user_id: "zerotwo" // You can also use anime_id instead of user_id
}).then((res) => {
  // some code
});
```

Also, if method must be a POST instead of GET (e.g. messages for send message)
You should set "method" parameter:

```js
shiki.api.messages({
  method: "post",
  message: { // parameters for post request
    body: "Hello!",
    from_id: 123,
    to_id: 456,
    kind: "private"
  }
}).then((res) => {
  // some code
});
```

Parameters for request is merged with wrapper parameters <br>
In deep, he's get next parameters if exists: **method**, **user_id**, **anime_id** <br>
And removes it from request parameters