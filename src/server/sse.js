const { tap } = require('ramda');
const { timer } = require('./utils');
const debug = require('debug')('sse');
const { equals, prop, reject } = require('ramda');

const createSSE = id => {
  let count = 0;
  let subscribers = [];
  let stopTimer = null; // workaround of closing connection by heroku

  const send = (res, id, event, data) => {
    res.write(`id: ${id}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const emit = (event, data) => {
    count += 1;
    subscribers.forEach(res => {
      send(res, count, event, data);
    });
  };

  const upgradeHTTP = res => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  };

  const subscribe = res => {
    if (subscribers.length === 0) {
      // prevent heroku from closing the SSE connection by sending pings
      stopTimer = timer(process.env.HEROKU_SSE_PING_MS, () => {
        emit('ping', null);
      });
      debug('start sse timer', id);
    }

    subscribers.push(tap(upgradeHTTP, res));
  };

  const unsubscribe = res => {
    subscribers = reject(equals(res), subscribers);
    if (subscribers.length === 0) {
      debug('stop sse timer', id);
      stopTimer();
    }
  };

  const subscribersCount = () => subscribers.length;

  return {
    subscribe,
    unsubscribe,
    emit,
    subscribersCount,
  };
};

const pool = {};
const getSSE = id => prop(id, pool) || prop(id, Object.assign(pool, { [id]: createSSE(id) }));

module.exports = { getSSE };
