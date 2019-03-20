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

### Получение списка серий
```js
shiki.utils.listEpisodes({
  id: 10568 // указываем id тайтла
}).then((r) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
});
```
##### Возвращает следующее:
```js
[
  {
    "number": 1, // номер серии
    "kinds": [ // доступные варианты
      "озвучка",
      "субтитры",
      "оригинал"
    ],
    "hostings": [  // доступные хостинги
      "vk",
      "smotretanime",
      "sibnet",
      "animedia"
    ]
  },
  ...
]
```

### Получение списка источников для серии
```js
shiki.utils.listEpisodeSources({
  id: 10568,
  number: 1 // указываем номер серии
}).then((r) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
});
```
##### Возвращает следующее:
```js
[
  {
    "type": "fandub", // тип перевода
    "items": [ // список доступных источников
      {
        "author": "AniDUB (Inspector_Gadjet & Murder princess)",
        "video_id": 1819852, // id видео на сайте
        "hosting": "vk.com",
        "is_bluray": true // если видео является blue-ray rip'ом
      },
      ...
    ]
  },
  {
    "type": "subtitles",
    "items": [
      {
        "author": "Dreamers Team",
        "video_id": 650888,
        "hosting": "vk.com",
        "is_bluray": false
      },
      ...
    ]
  },
  {
    "type": "raw",
    "items": [
      {
        "author": "Yousei-raws",
        "video_id": 1122925,
        "hosting": "smotretanime.ru",
        "is_bluray": true
      }
      ...
    ]
  },
]
```
Замечание: **fandub** - озвучка, **subtitles** - субтитры, **raw** - оригинал

### Получение ссылки на встраиваемый плеер
```js
shiki.utils.parseIframeLink({
  id: 10568,
  number: 1,
  video_id: 1819852 // указываем video_id из предыдущего запроса
}).then((r) => {
  // дальнейший код
}).catch((err) => {
  // обрабатываем ошибку
});
```
##### Возвращает ссылку:
```
https://vk.com/video_ext.php?oid=-64282268&id=171402167&hash=49e1cb0e49ee4931
```

### Получение прямой ссылки на видео
В модуле были также реализованы парсеры популярных источников на шикимори: vk, smortetanime и sibnet<br>
С помощью предыдущего метода получаем ссылку на встраиваемый плеер, затем передаем её в функцию:

```js
shiki.utils.getIframeSources("https://vk.com/video_ext.php?oid=-64282268&id=171402167&hash=49e1cb0e49ee4931").then((r) => {
  // дальнейший код
}).catch((err) => {
  // если для хостинга нет парсера
});
```

##### Возвращает следющее:
```js
{
  "sources": [
    {
      "is_divided": false, // true, если видео разделено на несколько источников
      "quality": "240",
      "url": "https://cs541109.vkuservideo.net/3/u285764482/videos/58e62834e4.240.mp4?extra=IU5mjjiJtzXGg19ZJ31TfMh1J7ctHlDreHdi1KusIMt3T1swuIFAi8mrgkernRqs5SJVf7AZTgo3ur7VmyWp38jcQq5nsJGIPm3eO8xc36cpNuy1PApOy6qprF6fDbPC-3aC4gI"
    },
    {
      "is_divided": false,
      "quality": "360",
      "url": "https://cs541109.vkuservideo.net/3/u285764482/videos/58e62834e4.360.mp4?extra=IU5mjjiJtzXGg19ZJ31TfMh1J7ctHlDreHdi1KusIMt3T1swuIFAi8mrgkernRqs5SJVf7AZTgo3ur7VmyWp38jcQq5nsJGIPm3eO8xc36cpNuy1PApOy6qprF6fDbPC-3aC4gI"
    },
    ...
  ],
  "subtitles": null,
  "title": "[ABD] Kamisama no Memo-chou / Блокнот Бога [09 из 12] Inspector_Gadjet &amp; Murder_Princess"
}
```
Возвращаемые ответы могут отличаться, в силу того что каждый ресурс по своему реализует воспроизведение<br>
Поле **url** также может содержать массив, содержащий ссылки на один эпизод (например, половина находится по одной ссылке, а другая половина по другой), это относится только к сервису smotretanime, он же возвращает ссылку на субтитры, ибо они не зашиты в самом видео, а идут отдельно.<br>

Также, есть еще одна проблема с sibnet: при прямом переходе на источник, он возвращает ошибку 403. Происходит это из-за того, что ему нужно передавать заголовок Referer при подключении, поэтому в ответе вместе с остальными параметрами еще приходит поле headers, которые были использованы для получения прямой ссылки.