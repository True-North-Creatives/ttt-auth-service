"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _roles = require("ttt-packages/lib/constants/roles");

var _auth = _interopRequireDefault(require("ttt-packages/lib/middleware/auth"));

var _auth2 = require("./auth.controller");

var router = _express["default"].Router();

router.post('/signin', _auth2.verifyPass, _auth2.authenticate);
router.post('/logout', _auth2.logout);
router.get('/user_exists', (0, _auth["default"])(_roles.route.USER_EXISTS), _auth2.isUserPresent);
router.post('/signup', _auth2.createUser);
router.post('/reset', _auth2.reset);
router.get('/reset/:id', _auth2.verify);
router.patch('/update', _auth2.resetPass);
var _default = router;
exports["default"] = _default;