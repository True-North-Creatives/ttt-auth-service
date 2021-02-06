import express from 'express';

import { route } from 'ttt-packages/lib/constants/roles';
import authenticator from '../../../controllers/auth/token.controller';
// import {userPresent} from 'ttt-packages/lib/services/user.service';
import authorize from '../../../middlewares/auth';

const router = express.Router();

router.post('/signin', authenticator.verifyPass, authenticator.authenticate);
router.post('/logout', authenticator.logout);

router.get(
  '/user_exists',
  authorize(route.USER_EXISTS),
  userPresent,
);

router.post('/signup', userService.createUser);
router.post('/reset', authenticator.reset);
router.get('/reset/:id', authenticator.verify);
router.post('/update', authenticator.resetPass);

export default router;
