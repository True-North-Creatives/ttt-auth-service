"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSubscriptionActive = exports.verifyResetURL = exports.removeResetURL = exports.setResetURL = exports.getAllUsers = exports.userPresent = exports.deleteUserById = exports.updatePass = exports.updateUser = exports.getUserByFilter = exports.queryUsers = exports.isEmailTaken = exports.createUser = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _roles = require("ttt-packages/lib/constants/roles");

var _errorMap = _interopRequireDefault(require("ttt-packages/lib/constants/errorMap"));

var _helpers = require("ttt-packages/lib/utils/helpers");

var _user = _interopRequireDefault(require("ttt-packages/lib/models/user.model"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Create a user
 * @param {object} payload
 * @return {User}
 */
var createUser = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(payload) {
    var userID, user;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return isEmailTaken(payload.email);

          case 2:
            if (!_context.sent) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", {
              error: _objectSpread({}, _errorMap["default"]['AUTH-107']),
              status: _httpStatus["default"].BAD_REQUEST
            });

          case 4:
            userID = (0, _helpers.generateUserId)();
            _context.next = 7;
            return _user["default"].create(_objectSpread(_objectSpread({}, payload), {}, {
              uid: userID
            }));

          case 7:
            user = _context.sent;
            return _context.abrupt("return", {
              data: user,
              status: _httpStatus["default"].CREATED
            });

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function createUser(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.createUser = createUser;

var isEmailTaken = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(email) {
    var user;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _user["default"].findOne({
              email: email
            });

          case 2:
            user = _context2.sent;
            return _context2.abrupt("return", !!user);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function isEmailTaken(_x2) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * Query for users
 * @param {object} filter - Mongo filter
 * @param {object} options - Query options
 * @return {Promise<QueryResult>}
 */


exports.isEmailTaken = isEmailTaken;

var queryUsers = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(filter, options) {
    var users;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _user["default"].paginate(filter, options);

          case 2:
            users = _context3.sent;
            return _context3.abrupt("return", users);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function queryUsers(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();
/**
 * Get user by email
 * @param {string} filter
 * @return {User} user Model
 */


exports.queryUsers = queryUsers;

var getUserByFilter = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(filter) {
    var user;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return _user["default"].findOne(filter);

          case 2:
            user = _context4.sent;
            return _context4.abrupt("return", user);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getUserByFilter(_x5) {
    return _ref4.apply(this, arguments);
  };
}();
/**
 * Update user by email id
 * @param {objectId} userId
 * @param {object} updateBody
 * @return {Promise<User>}
 */


exports.getUserByFilter = getUserByFilter;

var updateUser = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(email, payload) {
    var user;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _user["default"].findOneAndUpdate({
              email: email
            }, _objectSpread({}, payload)).exec();

          case 2:
            user = _context5.sent;

            if (user) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", _objectSpread(_objectSpread({}, _errorMap["default"]['AUTH-100']), {}, {
              httpStatus: _httpStatus["default"].BAD_REQUEST
            }));

          case 5:
            return _context5.abrupt("return", user);

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function updateUser(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();
/**
 *
 * @param {*} uid
 * @param {*} pass
 */


exports.updateUser = updateUser;

var updatePass = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(email, pass) {
    var res;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.t0 = _user["default"];
            _context6.t1 = {
              email: email
            };
            _context6.next = 4;
            return _bcrypt["default"].hash(pass, 8);

          case 4:
            _context6.t2 = _context6.sent;
            _context6.t3 = {
              pass: _context6.t2
            };
            _context6.next = 8;
            return _context6.t0.updateOne.call(_context6.t0, _context6.t1, _context6.t3);

          case 8:
            res = _context6.sent;
            return _context6.abrupt("return", res);

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function updatePass(_x8, _x9) {
    return _ref6.apply(this, arguments);
  };
}();
/**
 * Delete user by email id
 * @param {String} uid
 * @return {Promise<User>}
 */


exports.updatePass = updatePass;

var deleteUserById = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(uid) {
    var user;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return getUserByFilter({
              uid: uid
            });

          case 2:
            user = _context7.sent;

            if (user) {
              _context7.next = 5;
              break;
            }

            return _context7.abrupt("return", _objectSpread(_objectSpread({}, _errorMap["default"]['AUTH-100']), {}, {
              httpStatus: _httpStatus["default"].BAD_REQUEST
            }));

          case 5:
            _context7.next = 7;
            return user.remove();

          case 7:
            return _context7.abrupt("return", user);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function deleteUserById(_x10) {
    return _ref7.apply(this, arguments);
  };
}();
/**
 * check if email ID is present
 * @param {string} email
 */


exports.deleteUserById = deleteUserById;

var userPresent = /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(email) {
    var user;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _user["default"].isEmailTaken(email);

          case 2:
            user = _context8.sent;
            return _context8.abrupt("return", user);

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function userPresent(_x11) {
    return _ref8.apply(this, arguments);
  };
}();
/**
 * Gets all users
 */


exports.userPresent = userPresent;

var getAllUsers = /*#__PURE__*/function () {
  var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
    var user;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return _user["default"].find();

          case 2:
            user = _context9.sent;
            return _context9.abrupt("return", user);

          case 4:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function getAllUsers() {
    return _ref9.apply(this, arguments);
  };
}();
/**
 *
 * @param {string} email
 * @param {string} token
 */


exports.getAllUsers = getAllUsers;

var setResetURL = /*#__PURE__*/function () {
  var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(email, token) {
    var user;
    return _regenerator["default"].wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return _user["default"].findOneAndUpdate({
              email: email
            }, {
              resetURL: token
            }).lean();

          case 2:
            user = _context10.sent;
            return _context10.abrupt("return", user !== null);

          case 4:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function setResetURL(_x12, _x13) {
    return _ref10.apply(this, arguments);
  };
}();
/**
 *
 * @param {string} email
 */


exports.setResetURL = setResetURL;

var removeResetURL = /*#__PURE__*/function () {
  var _ref11 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(email) {
    var user;
    return _regenerator["default"].wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return _user["default"].findOneAndUpdate({
              email: email
            }, {
              token: undefined
            }).exec();

          case 2:
            user = _context11.sent;
            return _context11.abrupt("return", user !== null);

          case 4:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function removeResetURL(_x14) {
    return _ref11.apply(this, arguments);
  };
}();
/**
 *
 * @param {string} email
 * @param {string} token
 */


exports.removeResetURL = removeResetURL;

var verifyResetURL = /*#__PURE__*/function () {
  var _ref12 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(email, token) {
    var _yield$User$findOne$l, resetURL;

    return _regenerator["default"].wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return _user["default"].findOne({
              email: email
            }).lean();

          case 2:
            _yield$User$findOne$l = _context12.sent;
            resetURL = _yield$User$findOne$l.resetURL;
            return _context12.abrupt("return", token === resetURL);

          case 5:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function verifyResetURL(_x15, _x16) {
    return _ref12.apply(this, arguments);
  };
}();
/**
 *
 * @param {User} user
 */


exports.verifyResetURL = verifyResetURL;

var isSubscriptionActive = function isSubscriptionActive(user) {
  return user.role.includes(_roles.ROLES.Default);
};

exports.isSubscriptionActive = isSubscriptionActive;