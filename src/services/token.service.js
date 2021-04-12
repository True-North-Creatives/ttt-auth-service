import jwt from 'jsonwebtoken';
import { updateUser } from './user.service';

/**
 * Update the refresh token in user database
 * @param {object} user
 * @param {object} token
 * @return {object} updated user model
 */
export const updateRefreshToken = async (user, token) => {
  const updatedUser = await updateUser(user.email, {
    refreshToken: token,
  });
  return updatedUser;
};

/**
 *
 * @param {object} user
 * @param {object} token
 * @return {object} updated user model
 */
export const deleteRefreshToken = async (user, token) => {
  const index = user.refreshToken.indexOf(token);
  if (index > -1) {
    user.refreshToken.splice(index, 1);
  }
  const updatedUser = await updateUser(user.email, user);
  return updatedUser;
};

/**
 * generates tokens and sets them in the response cookies
 * @param {object} res
 * @param {object} data
 * @return {object} access token
 */
export const generateAccessTokens = (res, data) => {
  const accessToken = jwt.sign(
    { uid: data.email, role: data.role },
    process.env.secret,
    {
      expiresIn: '60m',
    },
  );
  res.cookie('at', accessToken, { maxAge: 1000 * 60 * 60, httpOnly: true });
  return accessToken;
};

/**
 * packs the payload to jwt
 * @param {object} data
 * @return {object} jwt token
 */
export const generateVerificationTokens = (data) => {
  console.log('secret', process.env.secret, );
  return jwt.sign({ ...data }, process.env.secret, {
  expiresIn: '60m',
});}

/**
 *
 * @param {object} res
 * @param {object} data
 * @return {object} refresh token
 */
const generateRefreshTokens = (res, data) => {
  const refreshToken = jwt.sign(
    { uid: data.email, role: data.role },
    process.env.secret,
    {
      expiresIn: '14 days',
    },
  );
  res.cookie('rt', refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });
  return refreshToken;
};

/**
 * Generates both access token and refresh token
 * @param {object} res
 * @param {object} data
 * @return {object} access token and refresh token
 */
export const generateTokens = (res, data) => {
  const accessToken = generateAccessTokens(res, data);
  const refreshToken = generateRefreshTokens(res, data);
  return { accessToken, refreshToken };
};

/**
 *
 * @param {string} token
 * @return {object} unpacked payload or null if unpack fails
 */
export const isValidToken = (token = '') => {
  try {
    return jwt.verify(token, process.env.secret);
  } catch (e) {
    return null;
  }
};
