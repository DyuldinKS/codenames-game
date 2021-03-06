const { allPass, gte, lte, prop, sort } = require('ramda');
const { customAlphabet } = require('nanoid');

const generateId = customAlphabet('1234567890abcdef', 7);

const seq = (from, to) =>
  Array(to - from)
    .fill(0)
    .map((_, i) => i + from);

const randomInt = (from, to) => Math.floor(Math.random() * (from - to)) + to;

const randomFrom = xs => prop(randomInt(0, xs.length), xs);

const getNRandomItems = (n, xs, selected = []) => {
  const words = [...selected, ...seq(selected.length, n).map(() => randomFrom(xs))];
  const unique = new Set(words);
  return unique.size < n ? getNRandomItems(n, xs, [...unique]) : words;
};

const shuffle = sort(() => 0.5 - Math.random());

const isNumBetween = ([min, max]) => allPass([lte(min), gte(max)]);

const timer = (ms, f) => {
  let to = null;
  const recursiveTimer = () => {
    stop();
    to = setTimeout(() => {
      f();
      recursiveTimer();
    }, ms);
  };

  const stop = () => clearTimeout(to);
  const postpone = () => {
    stop();
    recursiveTimer();
  };

  recursiveTimer();

  return { stop, postpone };
};

module.exports = {
  generateId,
  seq,
  randomFrom,
  getNRandomItems,
  shuffle,
  isNumBetween,
  timer,
};
