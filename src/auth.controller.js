import httpStatus from 'http-status';
import logger from 'ttt-packages/lib/config/logger';
import { EMAIL } from 'ttt-packages/lib/constants/email.constants';
import { constructResetUrl } from 'ttt-packages/lib/utils/helpers';
import errorCode, { customError } from 'ttt-packages/lib/constants/errorMap';
import { sendPasswordResetMail, sendConfirmationMail } from 'ttt-packages/lib/api/mail.api';
import {
  getUserByFilter, isSubscriptionActive, setResetURL, verifyResetURL, updatePass, userPresent,
} from './services/user.service';
import {
  generateTokens,
  updateRefreshToken,
  isValidToken,
  deleteRefreshToken,
  generateAccessTokens,
  generateVerificationTokens,
} from './services/token.service';

export const relogin = (res, message = 'Login Expired, Please login') => {
  res.clearCookie('rt');
  res.clearCookie('at');
  logger.warn('Relogin');
  return res.status(httpStatus.OK).json({ message, status: false });
};

export const signUp = async (res, user) => {
  const { refreshToken } = generateTokens(res, {
    email: user.email,
    role: user.role,
  });
  updateRefreshToken(user, refreshToken);
  logger.info('New Device Login', user.email);
};

export const logout = async (req, res) => {
  if (req.cookies.rt !== undefined) {
    const payload = isValidToken(req.cookies.rt);
    if (payload !== null) {
      const user = await getUserByFilter(payload.uid);
      deleteRefreshToken(user, req.cookies.rt);
    }
  }
  res.clearCookie('rt');
  res.clearCookie('at');
  res.send({ status: true });
};

export const authenticate = async (req, res) => {
  if (!req.body.uid) {
    return res.status(httpStatus.BAD_REQUEST).send({

    });
  }
  const user = await getUserByFilter({ uid: req.body.uid });
  if (!user) {
    // user not found
    return res.status(httpStatus.NOT_FOUND).send({
      code: 101,
      message: 'Unknown user, Please signup before login',
    });
  }

  // check if payment is done
  if (!isSubscriptionActive(user)) {
    return res.status(httpStatus.OK).send(errorCode[104]);
  }

  const accessToken = req.cookies.at;
  const refreshToken = req.cookies.rt;

  const refreshPayload = refreshToken && isValidToken(refreshToken);
  const accessPayload = refreshToken && isValidToken(accessToken);

  if (accessToken === undefined) {
    if (refreshToken === undefined) {
      // New device or New User
      return user && signUp(res, user)
        ? res.send({ status: true })
        : res.send({ status: false });
    }
    if (refreshPayload === null) {
      // invalid Refresh token and undefined Access token
      return relogin(res);
    }
    // valid refreshToken, undefined Access token
    generateAccessTokens(res, { email: refreshPayload.uid });
  } else {
    if (accessPayload) {
      // valid access token
      const result = getUserByFilter({ uid: accessPayload.uid });
      if (!result) return relogin(res, 'Unknow token, needs authentication');
      return res.status(httpStatus.OK).send({ status: true });
    }
    // invalid Access token
    if (refreshToken !== undefined) {
      if (refreshPayload === null) {
        return relogin(res);
      }
      generateAccessTokens(res, {
        email: refreshPayload.uid,
      });
    } else {
      return relogin(res);
    }
  }
  return res.send({ status: true });
};

export const reset = async (req, res) => {
  const user = await getUserByFilter({ uid: req.body.uid });
  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: 'user not found' });
  }
  if (user.providerId !== EMAIL) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: `You have signed up with ${user.providerId}` });
  }
  const token = generateVerificationTokens({
    email: user.email,
  });
  // update the DB with the token
  await setResetURL(user.email, token);
  const { status, data } = sendPasswordResetMail(user.email, user.name, constructResetUrl(token));
  return res.status(status).send(data);
};

export const verify = async (req, res) => {
  const token = req.params.id;
  const { email = {} } = isValidToken(token);
  const result = await verifyResetURL(email, token);
  return res.status(httpStatus.OK).send({ result, email });
};

export const resetPass = async (req, res) => {
  const { token, pass } = req.body;
  const { email } = isValidToken(token);
  const result = await verifyResetURL(email, token);
  const updated = result
        && (await updatePass(email, pass)) !== (null || undefined);
  if (updated) {
    setResetURL(email, undefined);
  }
  return res.status(httpStatus.OK).send({ email, updated });
};

export const verifyPass = async (req, res, next) => {
  const { email, pass } = req.body;
  if (email === '' || pass === '') {
    return res.status(httpStatus.NOT_FOUND).send({
      ...errorCode[103],
    });
  }
  const user = await getUserByFilter({ email });
  if (!user) {
    return res.status(httpStatus.OK).send({
      message: `${email} not found, please signup`,
      error: errorCode[101],
    });
  }
  if (user.providerId !== 'EMAIL') {
    // if its not a email provider, skip the password match
    return next();
  }
  const result = await user.isPasswordMatch(pass, user.pass);
  if (result) {
    // if password is a match, call on authenticate
    return next();
  }
  return res.status(httpStatus.NOT_FOUND).send({
    message: 'email or password mismatch',
    error: errorCode[102],
  });
};

export const isUserPresent = async (req, res) => {
  if (!req.body.email) {
    const payload = customError('email is not present')['CUS-100'];
    return res.status(httpStatus.BAD_REQUEST).send(payload);
  }
  const user = userPresent(req.body.email);
  return res.status(httpStatus.OK).send(!!user);
};

export const createUser = async (req, res) => {
  const payload = req.body;
  if (payload.providerId === 'EMAIL') {
    const token = generateVerificationTokens({
      email: payload.email,
    });
    payload.resetURL = token;
  }

  const user = await createUser(payload);
  if (payload.providerId !== 'EMAIL') {
    return res.status(httpStatus.CREATED).send(payload);
  }

  logger.info('New User Signup', user.email);
  const { status, data } = await sendConfirmationMail(payload.email, payload.resetURL);
  if (status !== httpStatus.OK) {
    logger.warn(`Failed to intitate the confiramtion mail, for user: ${payload.email}, stacktrace: ${data}`);
  }
  return res.status(httpStatus.CREATED).send(payload);
};
