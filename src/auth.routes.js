import express from 'express';

import { route } from 'ttt-packages/lib/constants/roles';
import authorize from 'ttt-packages/lib/middleware/auth';
import {
  verifyPass, authenticate, logout, reset, verify, resetPass, isUserPresent, createUser,
} from './auth.controller';

const router = express.Router();

router.post('/signin', verifyPass, authenticate);
router.post('/logout', logout);

router.get(
  '/user_exists',
  authorize(route.USER_EXISTS),
  isUserPresent,
);

router.post('/signup', createUser);
router.post('/reset', reset);
router.get('/reset/:id', verify);
router.patch('/update', resetPass);

export default router;
