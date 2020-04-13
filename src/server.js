const path = require('path');
const express = require('express');
const { generate } = require('nanoid');
const R = require('ramda');
const bodyParser = require('body-parser');
const { prop, reverse, reject, propEq } = R;

// prettier-ignore
const DICT = 'автомат,агент,адвокат,акт,актёр,акция,альбом,Америка,амфибия,ангел,Англия,аппарат,арена,атлас,атлет,Африка,бабочка,багет,база,баланс,банк,банка,баня,бар,барак,барьер,бассейн,батарея,Бах,башня,белки,белый,берёза,Берлин,билет,биржа,битва,блин,блок,боб,боевик,бокс,болезнь,больница,бомба,боров,бор,борт,ботинок,бочка,брак,бревно,бубны,бумага,бутылка,бычок,бюст,вагон,вал,ведьма,век,великан,венец,вера,вертолёт,верфь,вес,весна,ветер,вечер,взгляд,вид,вилка,вирус,виски,вода,водолаз,вождь,воздух,война,волна,воля,вор,ворот,ворота,врач,время,выпечка,высота,выступление,гавань,газ,газель,галоп,гвоздь,гений,герб,Германия,герой,гигант,глаз,Голливуд,голова,голос,голубь,гольф,гора,горло,горн,город,Горький,град,гранат,гранит,гребень,Греция,гриф,группа,груша,губа,губка,гусеница,дама,дача,двор,дворник,день,дерево,десна,динозавр,диск,дождь,доза,доктор,долг,доля,дракон,драма,дробь,дружба,дуб,дума,духи,дыра,дятел,Египет,единорог,ёж,ёлка,ёрш,жасмин,железо,жизнь,жила,журавль,жучок,забор,завод,заговор,закат,залив,залог,замок,заноза,запад,запах,заяц,звезда,звонок,звук,зебра,зелень,земля,зерно,зима,змей,знак,золото,зона,зуб,игла,игра,икра,Индия,институт,инструмент,ирис,искра,источник,кабачок,кабинет,кавалер,кадр,казино,камень,камера,канал,кант,капитан,карабин,караул,карлик,карта,каток,каша,квадрат,кенгуру,кентавр,кетчуп,киви,кино,кисть,кит,Китай,класс,клетка,клинок,клуб,клык,ключ,кнопка,козёл,код,кокетка,кол,колода,колонка,колонна,кольцо,команда,комета,конёк,контрабандист,концерт,кора,корабль,корень,корова,королева,король,корона,коса,космос,кость,костюм,косяк,кот,котелок,кошка,край,кран,крепость,крест,кровать,крокодил,кролик,крона,крошка,круг,крыло,куб,кулак,курорт,курс,куст,лавка,лад,ладья,лазер,лама,лампа,ласка,лебедь,лев,легенда,лёд,лезвие,лейка,лес,лето,лимон,лимузин,линейка,линия,липа,лист,лицо,ложе,ложка,лом,Лондон,лопатка,лот,лошадь,лук,луна,луч,любовь,магазин,мак,малина,мамонт,мантия,мандарин,марка,марс,марш,маска,масло,масса,мастер,мат,машина,маяк,мёд,медведь,мелочь,место,метеор,механизм,меч,мечта,микроскоп,миллионер,мина,мир,модель,модуль,молния,моль,море,морковь,мороженое,Москва,мост,мотив,музыка,мука,мушка,мышь,мята,мяч,надежда,налёт,Наполеон,наряд,небо,небоскрёб,ниндзя,нитка,нога,нож,номер,норка,нос,носок,нота,ночь,няня,обезьяна,область,облом,образ,образование,обрез,обувь,овал,овсянка,огонь,огород,одежда,океан,окно,олень,олигарх,Олимп,опера,операция,опыт,орган,орден,орёл,орех,осень,осьминог,отель,отрава,охранник,очки,падение,палата,палец,палочка,панама,панель,пара,парад,парашют,Париж,парк,партия,пассаж,патрон,паук,пачка,перевод,переворот,перемена,перец,перо,перчатка,печать,пики,пила,пилот,пингвин,пирамида,пират,пистолет,письмо,Питер,пластик,плата,платформа,платье,плёнка,плитка,плод,пломба,площадь,пляж,побег,победа,повар,погон,подарок,подкова,подъём,поезд,покров,пол,поле,полет,полис,полиция,полоса,помёт,помпа,порода,порт,посол,пост,поток,почка,пояс,право,праздник,преграда,предложение,предмет,пресс,преступник,прибор,привод,призрак,принцесса,пришелец,проба,пробка,провод,проводник,программа,проказа,прокат,проспект,профиль,путешествие,путь,Пушкин,пятачок,радуга,разведчик,развод,разворот,разряд,рак,ракета,раковина,рассказ,раствор,резина,река,ресторан,рецепт,Рим,риф,робот,рог,род,роза,рок,роман,Россия,рот,рояль,ртуть,рубашка,рубка,ружье,рука,рукав,рулетка,ручка,рыба,рынок,рысь,рыцарь,сад,салат,салют,самолет,сантехник,Сатурн,сачок,свет,свеча,свидетель,секрет,секция,сердце,сеть,сидение,сила,сирень,скала,скат,склад,скрипка,слава,слон,смена,смерть,снаряд,снег,снеговик,снимок,собака,сова,совет,солдат,солнце,соль,сон,состав,союз,сплав,спорт,спутник,среда,ссылка,ставка,стадион,стан,станок,ствол,стекло,стена,стойка,стол,столб,стопа,стопка,страна,стрела,строй,строчка,струна,студент,стул,ступень,судьба,супергерой,сфера,схема,счёт,съезд,таз,такса,такт,танец,тарелка,тату,театр,телега,телескоп,телефон,тень,тепло,техника,течение,тигр,титан,титул,ткань,ток,том,точка,трава,треугольник,тройка,труба,труд,туба,тур,удар,ударник,удача,удел,узел,Урал,уран,урна,уровень,утка,утконос,утро,учёный,учитель,фаза,факел,фаланга,феникс,ферма,фига,финка,флейта,фокус,фонтан,форма,хвост,хлопок,холод,царь,цветок,Цезарь,центр,церковь,цилиндр,частица,часы,черви,честь,член,шайба,шайка,шар,шах,шашка,шина,шишка,шкала,школа,шоколад,шпагат,шпилька,шпион,штат,шуба,шум,экран,элемент,эльф,эфир,Юпитер,юрист,яблоко,ягода,яд,ядро,язык,якорь,Япония,ясли,ячмень'.split(',');
const DEFAULTS = {
  wordCountInGame: 25,
  teamCount: 2,
};

const app = express();

const games = {};

app.get('/', function (req, res) {
  res.send('hello world');
});

const randomFrom = xs => prop(Math.floor(Math.random() * xs.length), xs);
const seq = (from, to) =>
  Array(to - from)
    .fill(0)
    .map((_, i) => i + from);

const getNRandomItems = (n, xs, selected = []) => {
  // console.log(n, selected);
  const words = [...selected, ...seq(selected.length, n).map(() => randomFrom(xs))];
  const unique = new Set(words);
  return unique.size < n ? getNRandomItems(n, xs, [...unique]) : words;
};

// TODO: fix it if team count will be more than 2
const shuffle = xs => (Math.random() > 0.5 ? xs : reverse(xs));

const splitIntoNTeams = (n, words) =>
  shuffle(
    words.reduce(
      (teams, w, i) => {
        prop(i % n, teams).push(w);
        return teams;
      },
      seq(0, n).map(() => []),
    ),
  );

const createGame = () => {
  const { wordCountInGame, teamCount } = DEFAULTS;
  const words = getNRandomItems(wordCountInGame, DICT);
  console.log(words);
  const [fail, ...activeWords] = getNRandomItems(
    (wordCountInGame - 1) * (teamCount / (teamCount + 1)) + 2,
    seq(0, words.length),
  );
  console.log(fail, activeWords);

  return {
    words,
    fail,
    teamWords: splitIntoNTeams(teamCount, activeWords),
    opened: [],
    subscribers: [],
  };
};

/* **************** MIDDLEWARES ***************** */

const checkingGameExistence = (req, res, next) =>
  prop(req.params.gameName, games) ? next() : res.status(404).send('Game not found');

app.use('*', (req, res, next) => {
  console.log(req.url, req.params);
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ******************* STATIC ******************* */

app.use('/static', express.static(path.join(__dirname, 'client')));

app.get('/start/:gameName', (req, res) => {
  const gameName = req.params.gameName || generate('1234567890abcdef', 5);
  if (!prop(gameName, games)) {
    games[gameName] = createGame();
    // console.log(games);
  }
  res.redirect(`/${req.params.gameName}`);
});

app.get('/:gameName', checkingGameExistence, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

/* ********************* API ******************** */

app.get('/api/game/:gameName', checkingGameExistence, (req, res) => {
  res.json(prop(req.params.gameName, games));
});

const broadcastOpenedWords = ({ subscribers, opened }) => {
  subscribers.forEach(send => {
    send('opened', opened);
  });
};

app.post('/api/game/:gameName/open', checkingGameExistence, (req, res) => {
  const justOpened = req.body;
  const game = prop(req.params.gameName, games);
  if (!game.opened.includes(justOpened.idx)) {
    game.opened.push(justOpened.idx);
  }
  res.json({ opened: game.opened });
  broadcastOpenedWords(game);
});

const subsctiptionHander = () => {
  let count = 0;
  return (req, res) => {
    const game = prop(req.params.gameName, games);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`id: ${count}\n`);
    count += 1;

    const send = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    game.subscribers.push(send);

    req.on('close', () => {
      console.log('Connection closed by client');
      game.subscribers = reject(propEq(send), game.subscribers);
    });
  };
};

app.get('/api/game/:gameName/subscribe', checkingGameExistence, subsctiptionHander());

/* **************** ERROR HANDLER *************** */

app.use((err, req, res, next) => {
  console.log('Error handler.');
  console.log(req.url, err);
  res.status(500).send(err);
});

/* ******************** START ******************* */

const PORT = 8000;
app.listen(PORT, () => console.log('Listening port', PORT));
