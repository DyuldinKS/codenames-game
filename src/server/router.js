const path = require('path');
const express = require('express');
const R = require('ramda');
const debug = require('debug')('router');
const { checkingGameExistence } = require('./middlewares');
const { getSSE } = require('./sse');
const { prop } = R;

const staticRoutes = (app, { games, createGame, generateId }) => {
  app.use('/static', express.static(path.join(__dirname, '..', 'client')));

  app.get(['/', /^\/start\/?$/], (req, res) => {
    const gameName = generateId();
    if (!prop(gameName, games)) {
      games[gameName] = createGame(req.query);
    }
    res.redirect(`/${gameName}`);
  });

  app.get(['/:gameName', '/:gameName/admin'], checkingGameExistence(games), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  });
};

const api = (app, { games }) => {
  app.get('/api/game/:gameName', checkingGameExistence(games), (req, res) => {
    res.json(prop(req.params.gameName, games));
  });

  app.post('/api/game/:gameName/open', checkingGameExistence(games), (req, res) => {
    const justOpened = req.body;
    const { gameName } = req.params;
    const game = prop(gameName, games);
    if (!game.opened.includes(justOpened.idx)) {
      game.opened.push(justOpened.idx);
    }
    res.sendStatus(200);
    getSSE(gameName).emit('opened', game.opened);
  });

  app.get('/api/game/:gameName/subscribe', checkingGameExistence(games), (req, res) => {
    const sse = getSSE(req.params.gameName);
    sse.subscribe(res);
    req.on('close', () => {
      // TODO: generate id for clients
      debug('SSE connection closed by client, subscribers left:', sse.subscribersCount());
      sse.unsubscribe(res);
    });
  });
};

const router = (...params) => {
  staticRoutes(...params);
  api(...params);
};

exports.router = router;
