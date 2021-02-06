import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    payment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment',
      },
    ],
    familyName: {
      type: String,
      required: false,
    },
    givenName: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    resetURL: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    age: {
      type: Number,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    // On Successful SignUp
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    // subscriptionType: monthly, annually
    subscriptionType: {
      type: String,
      required: false,
    },
    // On Payment Success make isSubscribed as true
    isSubscribed: {
      type: Boolean,
      required: false,
    },
    place: {
      type: String,
      required: false,
    },
    // providerId: Google, Facebook
    providerId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    role: {
      type: Array,
    },
    pass: {
      type: String,
      required: false,
      trim: true,
      private: true, // used by the toJSON plugin
    },
  },
  {
    collection: 'users',
  },
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @return {Promise<boolean>}
 */
const isEmailTaken = async (email, excludeUserId) => {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isEmailTaken = isEmailTaken;

/**
 * Check if password matches the user's password
 * @param {string} password
 * @param {string} storedPass
 * @return {Promise<boolean>}
 */
const isPasswordMatch = async (password, storedPass) => bcrypt.compare(password, storedPass);

userSchema.methods.isPasswordMatch = isPasswordMatch;

const User = mongoose.model('user', userSchema);

export default User;
