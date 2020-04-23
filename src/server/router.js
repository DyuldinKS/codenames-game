const path = require('path');
const express = require('express');
const R = require('ramda');
const { checkingGameExistence } = require('./middlewares');
const { prop, equals, reject } = R;

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

  const broadcastOpenedWords = (count => {
    return ({ subscribers, opened }) => {
      count += 1;
      subscribers.forEach(send => {
        send(count, 'opened', opened);
      });
    };
  })(0);

  app.post('/api/game/:gameName/open', checkingGameExistence(games), (req, res) => {
    const justOpened = req.body;
    const game = prop(req.params.gameName, games);
    if (!game.opened.includes(justOpened.idx)) {
      game.opened.push(justOpened.idx);
    }
    res.json({ opened: game.opened });
    broadcastOpenedWords(game);
  });

  const subsctiptionHander = (req, res) => {
    const game = prop(req.params.gameName, games);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (id, event, data) => {
      res.write(`id: ${id}\n`);
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    game.subscribers.push(send);

    req.on('close', () => {
      console.log('Connection closed by client');
      game.subscribers = reject(equals(send), game.subscribers);
    });
  };

  app.get('/api/game/:gameName/subscribe', checkingGameExistence(games), subsctiptionHander);
};

const router = (...params) => {
  staticRoutes(...params);
  api(...params);
};

exports.router = router;
