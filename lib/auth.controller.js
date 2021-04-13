"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUser = exports.isUserPresent = exports.verifyPass = exports.resetPass = exports.verify = exports.reset = exports.authenticate = exports.logout = exports.signUp = exports.relogin = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _logger = _interopRequireDefault(require("ttt-packages/lib/config/logger"));

var _email = require("ttt-packages/lib/constants/email.constants");

var _helpers = require("ttt-packages/lib/utils/helpers");

var _errorMap = _interopRequireWildcard(require("ttt-packages/lib/constants/errorMap"));

var _mail = require("./services/mail.service");

var _user = require("./services/user.service");

var _token = require("./services/token.service");

var _UserModel = require("ttt-packages/lib/utils/UserModel.util");

var _roles = require("ttt-packages/lib/constants/roles");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var relogin = function relogin(res) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Login Expired, Please login";
  res.clearCookie("rt");
  res.clearCookie("at");

  _logger["default"].warn("Relogin");

  return res.status(_httpStatus["default"].OK).json({
    message: message,
    status: false
  });
};

exports.relogin = relogin;

var signUp = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(res, user) {
    var _generateTokens, refreshToken;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _generateTokens = (0, _token.generateTokens)(res, {
              email: user.email,
              role: user.role
            }), refreshToken = _generateTokens.refreshToken;
            (0, _token.updateRefreshToken)(user, refreshToken);

            _logger["default"].info("New Device Login", user.email);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function signUp(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.signUp = signUp;

var logout = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var payload, user;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(req.cookies.rt !== undefined)) {
              _context2.next = 7;
              break;
            }

            payload = (0, _token.isValidToken)(req.cookies.rt);

            if (!(payload !== null)) {
              _context2.next = 7;
              break;
            }

            _context2.next = 5;
            return (0, _user.getUserByFilter)(payload.uid);

          case 5:
            user = _context2.sent;
            (0, _token.deleteRefreshToken)(user, req.cookies.rt);

          case 7:
            res.clearCookie("rt");
            res.clearCookie("at");
            res.send({
              status: true
            });

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function logout(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.logout = logout;

var authenticate = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var user, accessToken, refreshToken, refreshPayload, accessPayload, result;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('Authencitatein');

            if (req.body.email) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({}));

          case 3:
            _context3.next = 5;
            return (0, _user.getUserByFilter)({
              email: req.body.email
            });

          case 5:
            user = _context3.sent;

            if (user) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap["default"]["AUTH-100"]
            }));

          case 8:
            console.log('Checking for adctive user'); // check if payment is done

            if ((0, _user.isSubscriptionActive)(user)) {
              _context3.next = 12;
              break;
            }

            (0, _token.generateTokens)(res, {
              email: user.email,
              role: _roles.ROLES.Pending
            });
            return _context3.abrupt("return", res.status(_httpStatus["default"].TEMPORARY_REDIRECT).send({
              error: _objectSpread(_objectSpread({}, _errorMap["default"]["AUTH-103"]), {}, {
                redirect: '/payment'
              })
            }));

          case 12:
            accessToken = req.cookies.at;
            refreshToken = req.cookies.rt;
            refreshPayload = refreshToken && (0, _token.isValidToken)(refreshToken);
            accessPayload = refreshToken && (0, _token.isValidToken)(accessToken);

            if (!(accessToken === undefined)) {
              _context3.next = 24;
              break;
            }

            if (!(refreshToken === undefined)) {
              _context3.next = 19;
              break;
            }

            return _context3.abrupt("return", user && signUp(res, user) ? res.send({
              status: true
            }) : res.send({
              status: false
            }));

          case 19:
            if (!(refreshPayload === null)) {
              _context3.next = 21;
              break;
            }

            return _context3.abrupt("return", relogin(res));

          case 21:
            // valid refreshToken, undefined Access token
            (0, _token.generateAccessTokens)(res, {
              email: refreshPayload.uid
            });
            _context3.next = 36;
            break;

          case 24:
            if (!accessPayload) {
              _context3.next = 29;
              break;
            }

            // valid access token
            result = (0, _user.getUserByFilter)({
              uid: accessPayload.uid
            });

            if (result) {
              _context3.next = 28;
              break;
            }

            return _context3.abrupt("return", relogin(res, "Unknow token, needs authentication"));

          case 28:
            return _context3.abrupt("return", res.status(_httpStatus["default"].OK).send({
              status: true
            }));

          case 29:
            if (!(refreshToken !== undefined)) {
              _context3.next = 35;
              break;
            }

            if (!(refreshPayload === null)) {
              _context3.next = 32;
              break;
            }

            return _context3.abrupt("return", relogin(res));

          case 32:
            (0, _token.generateAccessTokens)(res, {
              email: refreshPayload.uid
            });
            _context3.next = 36;
            break;

          case 35:
            return _context3.abrupt("return", relogin(res));

          case 36:
            return _context3.abrupt("return", res.send({
              status: true
            }));

          case 37:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function authenticate(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

exports.authenticate = authenticate;

var reset = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var user, token, _yield$sendPasswordRe, _yield$sendPasswordRe2, status, data;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _user.getUserByFilter)({
              email: req.body.email
            });

          case 2:
            user = _context4.sent;

            if (user) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              message: "user not found"
            }));

          case 5:
            if (!(user.providerId !== _email.EMAIL)) {
              _context4.next = 7;
              break;
            }

            return _context4.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              message: "You have signed up with ".concat(user.providerId)
            }));

          case 7:
            token = (0, _token.generateVerificationTokens)({
              email: user.email
            }); // update the DB with the token

            _context4.next = 10;
            return (0, _user.setResetURL)(user.email, token);

          case 10:
            _context4.next = 12;
            return (0, _mail.sendPasswordResetMail)(user.email, user.name, (0, _helpers.constructResetUrl)(token));

          case 12:
            _yield$sendPasswordRe = _context4.sent;
            _yield$sendPasswordRe2 = _yield$sendPasswordRe.status;
            status = _yield$sendPasswordRe2 === void 0 ? _httpStatus["default"].BAD_REQUEST : _yield$sendPasswordRe2;
            data = _yield$sendPasswordRe.data;
            console.log('here', status, data);
            return _context4.abrupt("return", res.status(status).send(data));

          case 18:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function reset(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

exports.reset = reset;

var verify = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var token, details, _details$email, email, result;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            token = req.params.id;
            details = (0, _token.isValidToken)(token);

            if (!(details === null)) {
              _context5.next = 4;
              break;
            }

            return _context5.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _objectSpread({}, _errorMap["default"]["AUTH-111"])
            }));

          case 4:
            _details$email = details.email, email = _details$email === void 0 ? {} : _details$email;
            _context5.next = 7;
            return (0, _user.verifyResetURL)(email, token);

          case 7:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(_httpStatus["default"].OK).send({
              result: result,
              email: email
            }));

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function verify(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

exports.verify = verify;

var resetPass = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var _req$body, token, pass, _isValidToken, email, result, updated;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _req$body = req.body, token = _req$body.token, pass = _req$body.pass;
            _isValidToken = (0, _token.isValidToken)(token), email = _isValidToken.email;
            _context6.next = 4;
            return (0, _user.verifyResetURL)(email, token);

          case 4:
            result = _context6.sent;
            _context6.t0 = result;

            if (!_context6.t0) {
              _context6.next = 12;
              break;
            }

            _context6.next = 9;
            return (0, _user.updatePass)(email, pass);

          case 9:
            _context6.t1 = _context6.sent;
            _context6.t2 = null || undefined;
            _context6.t0 = _context6.t1 !== _context6.t2;

          case 12:
            updated = _context6.t0;

            if (!updated) {
              _context6.next = 16;
              break;
            }

            (0, _user.setResetURL)(email, undefined);
            return _context6.abrupt("return", res.status(_httpStatus["default"].OK).send({
              email: email,
              updated: updated
            }));

          case 16:
            res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap.userErrorMap["USER-101"]
            });

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function resetPass(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();

exports.resetPass = resetPass;

var verifyPass = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res, next) {
    var _req$body2, email, pass, user, result;

    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _req$body2 = req.body, email = _req$body2.email, pass = _req$body2.pass;

            if (!(email === "" || pass === "")) {
              _context7.next = 3;
              break;
            }

            return _context7.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send(_objectSpread({}, _errorMap["default"]["AUTH-102"])));

          case 3:
            _context7.next = 5;
            return (0, _user.getUserByFilter)({
              email: email
            });

          case 5:
            user = _context7.sent;

            if (user) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              message: "".concat(email, " not found, please signup"),
              error: _errorMap["default"]["AUTH-100"]
            }));

          case 8:
            if (!(user.providerId !== "EMAIL")) {
              _context7.next = 12;
              break;
            }

            if (!pass) {
              _context7.next = 11;
              break;
            }

            return _context7.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap["default"]["AUTH-113"]
            }));

          case 11:
            return _context7.abrupt("return", next());

          case 12:
            if (user.pass) {
              _context7.next = 15;
              break;
            }

            res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap["default"]["AUTH-110"]
            });
            return _context7.abrupt("return");

          case 15:
            if (pass) {
              _context7.next = 18;
              break;
            }

            res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap["default"]["AUTH-112"]
            });
            return _context7.abrupt("return");

          case 18:
            console.log("Calling", pass, user);
            _context7.next = 21;
            return (0, _UserModel.isPasswordMatch)(pass, user.pass);

          case 21:
            result = _context7.sent;

            if (!result) {
              _context7.next = 24;
              break;
            }

            return _context7.abrupt("return", next());

          case 24:
            return _context7.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send({
              error: _errorMap["default"]["AUTH-102"]
            }));

          case 25:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function verifyPass(_x13, _x14, _x15) {
    return _ref7.apply(this, arguments);
  };
}();

exports.verifyPass = verifyPass;

var isUserPresent = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res) {
    var payload, user;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (req.body.email) {
              _context8.next = 3;
              break;
            }

            payload = (0, _errorMap.customError)("email is not present")["CUS-100"];
            return _context8.abrupt("return", res.status(_httpStatus["default"].BAD_REQUEST).send(payload));

          case 3:
            user = (0, _user.userPresent)(req.body.email);
            return _context8.abrupt("return", res.status(_httpStatus["default"].OK).send(!!user));

          case 5:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function isUserPresent(_x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}();

exports.isUserPresent = isUserPresent;

var createUser = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(req, res) {
    var payload, token, _yield$createUserServ, user, error, userCreationStatus, _yield$sendConfirmati, status, data;

    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            payload = req.body;

            if (payload.providerId === "EMAIL") {
              token = (0, _token.generateVerificationTokens)({
                email: payload.email
              });
              payload.resetURL = token;
            }

            _context9.next = 4;
            return (0, _user.createUser)(payload);

          case 4:
            _yield$createUserServ = _context9.sent;
            user = _yield$createUserServ.data;
            error = _yield$createUserServ.error;
            userCreationStatus = _yield$createUserServ.status;

            if (!error) {
              _context9.next = 10;
              break;
            }

            return _context9.abrupt("return", res.status(userCreationStatus).send(error));

          case 10:
            if (!(payload.providerId !== "EMAIL")) {
              _context9.next = 12;
              break;
            }

            return _context9.abrupt("return", res.status(_httpStatus["default"].CREATED).send(user));

          case 12:
            _logger["default"].info("New User Signup, ".concat(user.email));

            _logger["default"].debug("before calling confirmation api ".concat(payload.email, " ").concat(payload.resetURL));

            _context9.next = 16;
            return (0, _mail.sendConfirmationMail)(payload.email, payload.resetURL);

          case 16:
            _yield$sendConfirmati = _context9.sent;
            status = _yield$sendConfirmati.status;
            data = _yield$sendConfirmati.data;

            if (!(status !== _httpStatus["default"].OK)) {
              _context9.next = 22;
              break;
            }

            _logger["default"].warn("Failed to intitate the confiramtion mail, for user: ".concat(payload.email, ", stacktrace: ").concat(data, ", status: ").concat(status));

            return _context9.abrupt("return", res.status(_httpStatus["default"].OK).send({
              error: {
                message: "Mail not triggered, user created"
              }
            }));

          case 22:
            return _context9.abrupt("return", res.status(status).send(payload));

          case 23:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function createUser(_x18, _x19) {
    return _ref9.apply(this, arguments);
  };
}();

exports.createUser = createUser;