"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidToken = exports.generateTokens = exports.generateVerificationTokens = exports.generateAccessTokens = exports.deleteRefreshToken = exports.updateRefreshToken = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _user = require("./user.service");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Update the refresh token in user database
 * @param {object} user
 * @param {object} token
 * @return {object} updated user model
 */
var updateRefreshToken = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(user, token) {
    var updatedUser;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _user.updateUser)(user.email, {
              refreshToken: token
            });

          case 2:
            updatedUser = _context.sent;
            return _context.abrupt("return", updatedUser);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function updateRefreshToken(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
/**
 *
 * @param {object} user
 * @param {object} token
 * @return {object} updated user model
 */


exports.updateRefreshToken = updateRefreshToken;

var deleteRefreshToken = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(user, token) {
    var index, updatedUser;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            index = user.refreshToken.indexOf(token);

            if (index > -1) {
              user.refreshToken.splice(index, 1);
            }

            _context2.next = 4;
            return (0, _user.updateUser)(user.email, user);

          case 4:
            updatedUser = _context2.sent;
            return _context2.abrupt("return", updatedUser);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function deleteRefreshToken(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * generates tokens and sets them in the response cookies
 * @param {object} res
 * @param {object} data
 * @return {object} access token
 */


exports.deleteRefreshToken = deleteRefreshToken;

var generateAccessTokens = function generateAccessTokens(res, data) {
  var accessToken = _jsonwebtoken["default"].sign({
    uid: data.email,
    role: data.role
  }, process.env.secret, {
    expiresIn: '60m'
  });

  res.cookie('at', accessToken, {
    maxAge: 1000 * 60 * 60,
    httpOnly: true
  });
  return accessToken;
};
/**
 * packs the payload to jwt
 * @param {object} data
 * @return {object} jwt token
 */


exports.generateAccessTokens = generateAccessTokens;

var generateVerificationTokens = function generateVerificationTokens(data) {
  console.log('secret', process.env.secret);
  return _jsonwebtoken["default"].sign(_objectSpread({}, data), process.env.secret, {
    expiresIn: '60m'
  });
};
/**
 *
 * @param {object} res
 * @param {object} data
 * @return {object} refresh token
 */


exports.generateVerificationTokens = generateVerificationTokens;

var generateRefreshTokens = function generateRefreshTokens(res, data) {
  var refreshToken = _jsonwebtoken["default"].sign({
    uid: data.email,
    role: data.role
  }, process.env.secret, {
    expiresIn: '14 days'
  });

  res.cookie('rt', refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  });
  return refreshToken;
};
/**
 * Generates both access token and refresh token
 * @param {object} res
 * @param {object} data
 * @return {object} access token and refresh token
 */


var generateTokens = function generateTokens(res, data) {
  var accessToken = generateAccessTokens(res, data);
  var refreshToken = generateRefreshTokens(res, data);
  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  };
};
/**
 *
 * @param {string} token
 * @return {object} unpacked payload or null if unpack fails
 */


exports.generateTokens = generateTokens;

var isValidToken = function isValidToken() {
  var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  try {
    return _jsonwebtoken["default"].verify(token, process.env.secret);
  } catch (e) {
    return null;
  }
};

exports.isValidToken = isValidToken;