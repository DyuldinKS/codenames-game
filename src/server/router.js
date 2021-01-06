const path = require('path');
const express = require('express');
const R = require('ramda');
const debug = require('debug')('cn:router');
const { checkingGameExistence } = require('./middlewares');
const { getSSE } = require('./sse');
const { prop } = R;

const DIST_DIR = path.join(__dirname, '../../dist/');

const staticRoutes = app => {
  app.use('/static', express.static(DIST_DIR));

  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
};

const api = (app, { games, createGame }) => {
  app.post('/api/game', (req, res) => {
    const game = createGame(req.query);
    games[game.id] = game;
    res.send(game);
  });

  app.get('/api/game/:gameId', checkingGameExistence(games), (req, res) => {
    res.json(prop(req.params.gameId, games));
  });

  app.post('/api/game/:gameId/open', checkingGameExistence(games), (req, res) => {
    const justOpened = req.body;
    const { gameId } = req.params;
    const game = prop(gameId, games);
    if (!game.opened.includes(justOpened.idx)) {
      game.opened.push(justOpened.idx);
    }
    res.sendStatus(200);
    getSSE(gameId).emit('opened', game.opened);
  });

  app.get('/api/game/:gameId/subscribe', checkingGameExistence(games), (req, res) => {
    const sse = getSSE(req.params.gameId);
    sse.subscribe(res);
    req.on('close', () => {
      // TODO: generate id for clients
      sse.unsubscribe(res);
      debug('SSE connection closed by client');
    });
  });
};

const router = (...params) => {
  api(...params);
  staticRoutes(...params);
};

exports.router = router;
