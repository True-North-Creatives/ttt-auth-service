"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendConfirmationMail = exports.sendPasswordResetMail = exports.sendWelcomeMail = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _logger = _interopRequireDefault(require("ttt-packages/lib/config/logger"));

var sendWelcomeMail = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(email, name) {
    var payload, _yield$axios$post, status, data;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            payload = {
              name: name
            };
            _context.next = 3;
            return _axios["default"].post("".concat(process.env.MAIL_ENDPOINT, "/api/v2/mail/welcome/").concat(email), payload, {
              withCredentials: true,
              validateStatus: function validateStatus(status) {
                return status <= 503;
              }
            });

          case 3:
            _yield$axios$post = _context.sent;
            status = _yield$axios$post.status;
            data = _yield$axios$post.data;
            return _context.abrupt("return", {
              status: status,
              data: data
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function sendWelcomeMail(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.sendWelcomeMail = sendWelcomeMail;

var sendPasswordResetMail = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(email, name, redirecturl) {
    var payload, _yield$axios$post2, status, data;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            payload = {
              name: name,
              redirecturl: redirecturl
            };
            _context2.next = 3;
            return _axios["default"].post("".concat(process.env.MAIL_ENDPOINT, "/api/v2/mail/reset/").concat(email), payload, {
              withCredentials: true,
              validateStatus: function validateStatus(status) {
                return status <= 503;
              }
            });

          case 3:
            _yield$axios$post2 = _context2.sent;
            status = _yield$axios$post2.status;
            data = _yield$axios$post2.data;
            console.log(status, 'here');
            return _context2.abrupt("return", {
              status: status,
              data: data
            });

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function sendPasswordResetMail(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

exports.sendPasswordResetMail = sendPasswordResetMail;

var sendConfirmationMail = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(email, redirecturl) {
    var payload, _yield$axios$post3, status, data;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            payload = {
              redirecturl: redirecturl
            };
            _context3.next = 3;
            return _axios["default"].post("".concat(process.env.MAIL_ENDPOINT, "/api/v2/mail/confirm/").concat(email), payload, {
              withCredentials: true,
              validateStatus: function validateStatus(status) {
                return status <= 503;
              }
            });

          case 3:
            _yield$axios$post3 = _context3.sent;
            status = _yield$axios$post3.status;
            data = _yield$axios$post3.data;
            return _context3.abrupt("return", {
              status: status,
              data: data
            });

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function sendConfirmationMail(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

exports.sendConfirmationMail = sendConfirmationMail;