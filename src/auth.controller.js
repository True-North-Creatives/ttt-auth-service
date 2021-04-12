import httpStatus from "http-status";
import logger from "ttt-packages/lib/config/logger";
import { EMAIL } from "ttt-packages/lib/constants/email.constants";
import { constructResetUrl } from "ttt-packages/lib/utils/helpers";
import errorCode, { customError, userErrorMap } from "ttt-packages/lib/constants/errorMap";
import {
  sendPasswordResetMail,
  sendConfirmationMail,
} from "./services/mail.service";
import {
  getUserByFilter,
  isSubscriptionActive,
  setResetURL,
  verifyResetURL,
  updatePass,
  userPresent,
  createUser as createUserService,
} from "./services/user.service";
import {
  generateTokens,
  updateRefreshToken,
  isValidToken,
  deleteRefreshToken,
  generateAccessTokens,
  generateVerificationTokens,
} from "./services/token.service";
import { isPasswordMatch } from "ttt-packages/lib/utils/UserModel.util";
import {ROLES} from 'ttt-packages/lib/constants/roles';
export const relogin = (res, message = "Login Expired, Please login") => {
  res.clearCookie("rt");
  res.clearCookie("at");
  logger.warn("Relogin");
  return res.status(httpStatus.OK).json({ message, status: false });
};

export const signUp = async (res, user) => {
  const { refreshToken } = generateTokens(res, {
    email: user.email,
    role: user.role,
  });
  updateRefreshToken(user, refreshToken);
  logger.info("New Device Login", user.email);
};

export const logout = async (req, res) => {
  if (req.cookies.rt !== undefined) {
    const payload = isValidToken(req.cookies.rt);
    if (payload !== null) {
      const user = await getUserByFilter(payload.uid);
      deleteRefreshToken(user, req.cookies.rt);
    }
  }
  res.clearCookie("rt");
  res.clearCookie("at");
  res.send({ status: true });
};

export const authenticate = async (req, res) => {
  console.log('Authencitatein');
  if (!req.body.email) {
    return res.status(httpStatus.BAD_REQUEST).send({});
  }
  const user = await getUserByFilter({ email: req.body.email });
  if (!user) {
    // user not found
    return res.status(httpStatus.BAD_REQUEST).send({
      error: errorCode["AUTH-100"]
    });
  }
console.log('Checking for adctive user');
  // check if payment is done
  if (!isSubscriptionActive(user)) {
    generateTokens(res, {
      email: user.email,
      role: ROLES.Pending,
    });
    return res.status(httpStatus.TEMPORARY_REDIRECT).send({error: {...errorCode["AUTH-103"], redirect: '/payment'}});
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
      if (!result) return relogin(res, "Unknow token, needs authentication");
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
  const user = await getUserByFilter({ email: req.body.email });
  if (!user) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "user not found" });
    }
    if (user.providerId !== EMAIL) {
      return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: `You have signed up with ${user.providerId}` });
    }
    const token = generateVerificationTokens({
      email: user.email,
    });
    // update the DB with the token
    await setResetURL(user.email, token);
    const { status=httpStatus.BAD_REQUEST, data } = await sendPasswordResetMail(
      user.email,
      user.name,
      constructResetUrl(token)
      );
      console.log('here',status, data);
  return res.status(status).send(data);
};

export const verify = async (req, res) => {
  const token = req.params.id;
  const details = isValidToken(token);
  if (details === null) {
    return res.status(httpStatus.BAD_REQUEST).send({
      error: {
        ...errorCode["AUTH-111"],
      },
    });
  }
  const { email = {} } = details;
  const result = await verifyResetURL(email, token);
  return res.status(httpStatus.OK).send({ result, email });
};

export const resetPass = async (req, res) => {
  const { token, pass } = req.body;
  const { email } = isValidToken(token);
  const result = await verifyResetURL(email, token);
  const updated =
    result && (await updatePass(email, pass)) !== (null || undefined);
  if (updated) {
    setResetURL(email, undefined);
    return res.status(httpStatus.OK).send({ email, updated });
  }
  res.status(httpStatus.BAD_REQUEST).send({error: userErrorMap["USER-101"]})
};

export const verifyPass = async (req, res, next) => {
  const { email, pass } = req.body;
  if (email === "" || pass === "") {
    return res.status(httpStatus.BAD_REQUEST).send({
      ...errorCode["AUTH-102"],
    });
  }
  const user = await getUserByFilter({ email });
  if (!user) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: `${email} not found, please signup`,
      error: errorCode["AUTH-100"],
    });
  }
  if (user.providerId !== "EMAIL") {
    if(pass) {
      return res.status(httpStatus.BAD_REQUEST).send({error: errorCode["AUTH-113"]})
    }
    // if its not a email provider, skip the password match
    return next();
  }
  if (!user.pass) {
    res.status(httpStatus.BAD_REQUEST).send({ error: errorCode["AUTH-110"] });
    return;
  }
  if(!pass) {
    res.status(httpStatus.BAD_REQUEST).send({error: errorCode["AUTH-112"]});
    return;
  }
  console.log("Calling", pass, user);
  
  const result = await isPasswordMatch(pass, user.pass);
  if (result) {
    // if password is a match, call on authenticate
    return next();
  }
  return res.status(httpStatus.BAD_REQUEST).send({
    error: errorCode["AUTH-102"],
  });
};

export const isUserPresent = async (req, res) => {
  if (!req.body.email) {
    const payload = customError("email is not present")["CUS-100"];
    return res.status(httpStatus.BAD_REQUEST).send(payload);
  }
  const user = userPresent(req.body.email);
  return res.status(httpStatus.OK).send(!!user);
};

export const createUser = async (req, res) => {
  const payload = req.body;
  if (payload.providerId === "EMAIL") {
    const token = generateVerificationTokens({
      email: payload.email,
    });
    payload.resetURL = token;
  }

  const {
    data: user,
    error,
    status: userCreationStatus,
  } = await createUserService(payload);
  if (error) return res.status(userCreationStatus).send(error);
  if (payload.providerId !== "EMAIL") {
    return res.status(httpStatus.CREATED).send(user);
  }

  logger.info(`New User Signup, ${user.email}`);
  logger.debug(
    `before calling confirmation api ${payload.email} ${payload.resetURL}`
  );
  const { status, data } = await sendConfirmationMail(
    payload.email,
    payload.resetURL
  );
  if (status !== httpStatus.OK) {
    logger.warn(
      `Failed to intitate the confiramtion mail, for user: ${payload.email}, stacktrace: ${data}, status: ${status}`
    );
    return res.status(httpStatus.OK).send({
      error: {
        message: "Mail not triggered, user created",
      },
    });
  }
  return res.status(status).send(payload);
};
