# node-shikimori-api - Зачем? Надо.
## Установка
Через npm
```cmd
npm i node-shikimori-api
```
Через yarn
```cmd
yarn add node-shikimori-api
```

## Использование

### Основы:
```js
const Shikimori = require("node-shikimori-api");
const shiki = new Shikimori();

shiki.api.users({ // делаем запрос на https://shikimori.org/api/users/Syleront
  user_id: "Syleront"
}).then((res) => {
  // дальнейший код
});
```

### Авторизация через OAuth2
```js
const Shikimori = require("node-shikimori-api");
const shiki = new Shikimori();

shiki.auth.login({
  nickname: "zerotwo",
  password: "qwerty123"
}).then(() => {
  shiki.api.users({ // делаем запрос на https://shikimori.org/api/users/whoami
    section: "whoami"
  }).then((res) => {
    // возвращает информацию о юзере через которого залогинились
  });
}).catch((err) => {
  // обрабатываем ошибку
});
```

### Пути адресов
Шикимори использует некоторые части адреса как параметры (например, id пользователя)<br>
Как их передать? Допустим, нам нужно сделать запрос к ../api/users/zerotwo/history, где zerotwo - id пользователя (https://shikimori.org/api/doc/1.0/users/history)<br>
Для этого необходимо сделать следующее:

``` js
shiki.api.users({
  section: "history",
  user_id: "zerotwo" // также можно использовать anime_id вместо user_id
}).then((res) => {
  // дальнейший код
});
```

Также, если метод должен быть отправлен POST запросом вместо GET (например, для отправки сообщения)<br>
Для этого нужно использовать параметр "method"

```js
shiki.api.messages({
  method: "post",
  message: { // параметры которые нужно передать серверу
    body: "Hello!",
    from_id: 123,
    to_id: 456,
    kind: "private"
  }
}).then((res) => {
  // дальнейший код
});
```

## Кастомные методы
В модуле также реализованы кастомные методы, путем отслеживания запросов на сайте<br>
### Поиск тайтлов
```js
shiki.utils.search("k-on").then((res) => {
	// return a list of animes by this name
});
```