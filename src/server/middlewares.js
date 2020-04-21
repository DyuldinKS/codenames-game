const { prop } = require('ramda');

const checkingGameExistence = games => (req, res, next) =>
  prop(req.params.gameName, games)
    ? next()
    : console.log(404) || res.status(404).send('Game not found');

const logMiddleware = (req, res, next) => {
  console.log(req.url, req.params, req.body);
  next();
};

const errorHandler = (err, req, res, next) => {
  console.log('Error handler:', req.url, err);
  res.status(500).send(err);
};

module.exports = {
  checkingGameExistence,
  logMiddleware,
  errorHandler,
};
