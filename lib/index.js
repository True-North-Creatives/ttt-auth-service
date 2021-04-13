"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _logger = _interopRequireDefault(require("ttt-packages/lib/config/logger"));

var _customEnv = _interopRequireDefault(require("custom-env"));

var _auth = _interopRequireDefault(require("./auth.routes"));

var _DBDriver = _interopRequireDefault(require("ttt-packages/lib/adapter/DBDriver"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

_customEnv["default"].env(process.env.NODE_ENV);

var app = (0, _express["default"])();
app.use(_express["default"].json({
  extended: false
}));
app.use(_bodyParser["default"].json());
app.use((0, _cookieParser["default"])());
var local = ['https://localhost:3000'];
var stage = ['https://stage.api.timetotrain.fit'];
var prod = ['https://api.timetotrain.fit']; // enable cors

app.use((0, _cors["default"])({
  credentials: true,
  origin: [].concat(local, stage, prod)
}));
app.options('*', (0, _cors["default"])()); // v2 api routes

app.use('/api/v2/auth', _auth["default"]);
app.get('/api/v2/auth/health', function (req, res) {
  _logger["default"].debug('Health Monitor');

  res.status(_httpStatus["default"].OK).send('OK');
});
app.get('/api/v2/auth/config', function (req, res) {
  _logger["default"].debug('Invoked config');

  res.status(_httpStatus["default"].OK).send(JSON.parse(JSON.stringify(process.env)));
}); // app.listen(process.env.PORT, () => {
//   logger.info(`Auth server started at port: ${process.env.PORT}`);
// });

(0, _DBDriver["default"])(app, false);