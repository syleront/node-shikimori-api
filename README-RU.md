# node-shikimori-api - Зачем? Надо.
## Установка
Через **npm**
```cmd
npm i node-shikimori-api
```
Через **yarn**
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
}).catch((err) => {
  // обрабатываем ошибку
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
  user_id: "zerotwo" // также можно испольозвать anime_id или id вместо user_id
}).then((res) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
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
}).catch((err) => {
  // обрабатываем ошибку
});
```

### Использование V2 api
```js
shiki.api.user_rates({
  v: 2, // установить этот параметр
  id: 59278511,
  method: "patch",
  user_rate: {
    episodes: 1
  }
}).then((r) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
});
```

Параметры для запроса и самого апи передаются в один объект<br>
Внутри, скрипт проверяет есть ли следующие параметры: **method**, **user_id**, **anime_id**, **id**, **v** <br>
И если они есть, то он их забирает и обрабатывает, а остальное передается как query параметры для get запроса, или body для post/put/patch/delete/options запросов<br>

## Кастомные методы
В модуле также реализованы кастомные методы, путем отслеживания запросов на сайте и его парсинга<br>
### Поиск тайтлов
```js
shiki.utils.search({
  query: "k-on",
  type: "animes" // установлено по умолчанию
}).then((res) => {
	// возвращает список тайтлов по запросу
}).catch((err) => {
  // обрабатываем ошибку
});
```
Доступные параметры для поля **type**: animes, mangas, ranobe, characters, people, users<br>
Также, тип "people" может принимать параметр **kind**, который может иметь следующие значения: seyu, producer, mangaka<br>
##### Пример:
```js
shiki.utils.search({
  query: "hayao",
  type: "people",
  kind: "producer"
}).then((res) => {
  // Возвращает список режиссеров по запросу
}).catch((err) => {
  // обрабатываем ошибку
});
```

### Помечаем историю по дням
По умолчанию, api сайта не сортирует историю пользователей, но была написана функция, которая помечает элементы массива по дням<br>
Это поможет вам отфильтровать/отсортировать массив.
##### Использование:
```js
shiki.api.users({
  section: "history",
  user_id: "Syleront",
  limit: 100
}).then(shiki.utils.markHistory).then((r) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
});
```
##### Обычный ответ:
```js
{
  id: 136013914,
  created_at: "2019-03-12T18:37:35.621+03:00",
  description: "Просмотрены 2-й и 3-й эпизоды",
  target: {...}
}
```

##### Помеченный:
```js
{
  id: 136013914,
  created_at: "2019-03-12T18:37:35.621+03:00",
  day_mark: "today", // этот параметр
  day_mark_ru: "Сегодня", // и этот
  description: "Просмотрены 2-й и 3-й эпизоды",
  target: {...}
}
```
**day_mark** может иметь следующие значения: today, yesterday, weekly, other
