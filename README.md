# node-shikimori-api - Why? Because.
• [Документация на русском](https://github.com/syleront/node-shikimori-api/blob/master/README-RU.md)
## Installing
Using **npm**
```cmd
npm i node-shikimori-api
```
Using **yarn**
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
Shikimori takes some parameters in url paths (e.g. user id)<br>
How to transfer them? e.g. if you wanna to get ../api/users/zerotwo/history (https://shikimori.org/api/doc/1.0/users/history)<br>
You should do this:
``` js
shiki.api.users({
  section: "history",
  user_id: "zerotwo" // You can also use anime_id instead of user_id
}).then((res) => {
  // some code
});
```

Also, if method must be a POST instead of GET (e.g. messages for send message)<br>
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

## Custom methods
The module has some of its methods that were implemented by sniffing traffic to the site<br>
### Search
```js
shiki.utils.search({
  query: "k-on",
  type: "animes" // sets by default
}).then((res) => {
  // return a list of animes by this name
});
```
Available **types**: animes, mangas, ranobe, characters, people, users<br>
Also, "people" type may take **kind** params: seyu, producer, mangaka<br>
##### Example:
```js
shiki.utils.search({
  query: "hayao",
  type: "people",
  kind: "producer"
}).then((res) => {
  // return a list of producers by query
});
```

### Mark history by days
By default shikimori api doesn't sort your history in response, but I writed a function for mark response by days<br>
This will help you filter the response array.
##### Usage:
```js
shiki.api.users({
  section: "history",
  user_id: "Syleront",
  limit: 100
}).then(shiki.utils.markHistory).then((r) => {
  // some code
})
```
##### Default response:
```js
{
  id: 136013914,
  created_at: "2019-03-12T18:37:35.621+03:00",
  description: "Просмотрены 2-й и 3-й эпизоды",
  target: {} //...
}
```

##### Marked response:
```js
{
  id: 136013914,
  created_at: "2019-03-12T18:37:35.621+03:00",
  day_mark: "today", // this one
  day_mark_ru: "Сегодня", // and this
  description: "Просмотрены 2-й и 3-й эпизоды",
  target: {} //...
}
```
**day_mark** may have next values: today, yesterday, weekly, other