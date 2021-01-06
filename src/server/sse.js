const { tap } = require('ramda');
const { timer } = require('./utils');
const debug = require('debug')('cn:sse');
const { equals, prop, reject } = require('ramda');

const createSSE = id => {
  let count = 0;
  let subscribers = [];
  let pingTimer = null; // workaround of closing connection by heroku

  const send = (res, id, event, data) => {
    res.write(`id: ${id}\n`);
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const emit = (event, data) => {
    debug('emit', id, event, data, '| sub count:', subscriberCount());
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
      pingTimer = timer(process.env.HEROKU_SSE_PING_MS, () => {
        emit('ping', null);
      });
      debug('start sse pings', id);
    }

    subscribers.push(tap(upgradeHTTP, res));
    debug('subscribe', id, '| sub count:', subscriberCount());
  };

  const unsubscribe = res => {
    subscribers = reject(equals(res), subscribers);
    debug('unsubscribe', id, '| sub count:', subscriberCount());

    if (subscribers.length === 0) {
      debug('stop sse pings', id);
      pingTimer.stop();
    }
  };

  const subscriberCount = () => subscribers.length;

  return {
    subscribe,
    unsubscribe,
    emit: (...args) => {
      if (pingTimer) {
        pingTimer.postpone();
      }
      return emit(...args);
    },
    subscriberCount,
  };
};

const pool = {};
const getSSE = id => prop(id, pool) || prop(id, Object.assign(pool, { [id]: createSSE(id) }));

module.exports = { getSSE };
