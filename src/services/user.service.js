import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { ROLES } from 'ttt-packages/lib/constants/roles';
import errorMap from 'ttt-packages/lib/constants/errorMap';
import { generateUserId } from 'ttt-packages/lib/utils/helpers';
import User from '../models/user.model';

/**
 * Create a user
 * @param {object} payload
 * @return {User}
 */
export const createUser = async (payload) => {
  if (await User.isEmailTaken(payload.email)) {
    return { error: { ...errorMap['AUTH-107'] } };
  }
  const userID = generateUserId();
  const user = await User.create({ ...payload, uid: userID });
  return user;
};

/**
 * Query for users
 * @param {object} filter - Mongo filter
 * @param {object} options - Query options
 * @return {Promise<QueryResult>}
 */
export const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by email
 * @param {string} filter
 * @return {User} user Model
 */
export const getUserByFilter = async (filter) => {
  const user = await User.findOne(filter);
  return user;
};

/**
 * Update user by email id
 * @param {objectId} userId
 * @param {object} updateBody
 * @return {Promise<User>}
 */
export const updateUser = async (email, payload) => {
  const user = await User.findOneAndUpdate({ email }, { ...payload }).exec();
  if (!user) {
    return { ...errorMap['AUTH-100'], httpStatus: httpStatus.BAD_REQUEST };
  }
  return user;
};

/**
 *
 * @param {*} uid
 * @param {*} pass
 */
export const updatePass = async (uid, pass) => {
  const res = await User.updateOne(
    { uid },
    { pass: await bcrypt.hash(pass, 8) },
  );
  return res;
};

/**
 * Delete user by email id
 * @param {String} uid
 * @return {Promise<User>}
 */
export const deleteUserById = async (uid) => {
  const user = await getUserByFilter({ uid });
  if (!user) {
    return { ...errorMap['AUTH-100'], httpStatus: httpStatus.BAD_REQUEST };
  }
  await user.remove();
  return user;
};

/**
 * check if email ID is present
 * @param {string} email
 */
export const userPresent = async (email) => {
  const user = await User.isEmailTaken(email);
  return user;
};

/**
 * Gets all users
 */
export const getAllUsers = async () => {
  const user = await User.find();
  return user;
};

/**
 *
 * @param {string} email
 * @param {string} token
 */
export const setResetURL = async (email, token) => {
  const user = await User.findOneAndUpdate(
    { email },
    { resetURL: token },
  ).lean();
  return user !== null;
};

/**
 *
 * @param {string} email
 */
export const removeResetURL = async (email) => {
  const user = await User.findOneAndUpdate(
    { email },
    { token: undefined },
  ).exec();
  return user !== null;
};

/**
 *
 * @param {string} email
 * @param {string} token
 */
export const verifyResetURL = async (email, token) => {
  const { resetURL } = await User.findOne({ email }).lean();
  return token === resetURL;
};

/**
 *
 * @param {User} user
 */
export const isSubscriptionActive = (user) => user.role.includes(ROLES.Default);
