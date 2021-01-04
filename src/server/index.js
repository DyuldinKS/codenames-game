require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('cn:http:start');
const { router } = require('./router');
const game = require('./game');
const { logMiddleware, errorHandler } = require('./middlewares');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logMiddleware);

router(app, game);

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => debug('Listening port', PORT));
