const { prop } = require('ramda');
const debug = require('debug');

const checkingGameExistence = games => (req, res, next) =>
  prop(req.params.gameName, games) ? next() : res.status(404).send('Game not found');

const logHttpReq = debug('cn:http:req');

const logMiddleware = (req, res, next) => {
  logHttpReq(req.url, req.params, req.body);
  next();
};

const logHttpErr = debug('cn:http:err');

const errorHandler = (err, req, res, next) => {
  logHttpErr('HTTP err on', req.url, err);
  res.status(500).send(err);
};

module.exports = {
  checkingGameExistence,
  logMiddleware,
  errorHandler,
};
