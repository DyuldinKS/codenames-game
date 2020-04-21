const express = require('express');
const R = require('ramda');
const bodyParser = require('body-parser');
const { router } = require('./router');
const game = require('./game');
const { logMiddleware, errorHandler } = require('./middlewares');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logMiddleware);

router(app, game);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Listening port', PORT));
