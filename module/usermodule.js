const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: [20],
    minlength: [3],
  },
  password: {
    type: String,
    required: [true, "this field is required"],
    maxlength: [20],
    minlength: [3],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "this field is required"],
    validate: function (el) {
      return el === this.password;
    },
    message: "the password does not match",
  },
  email: {
    type: String,
    trim: true,
    required: true,
    validate: [validator.isEmail, "please enter a vaild email"],
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "it must be male or female",
    },
  },
  PasswordChangeAt: Date,
  RestToken: String,
  RestTokenExp: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.CheckPassword = async function (
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.isPasswordChange = function (JWTTimeStamp) {
  if (this.PasswordChangeAt) {
    const TimeChange = parseInt(this.PasswordChangeAt.getTime() / 1000, 10);
    return JWTTimeStamp < TimeChange;
  }
  return false;
};

userSchema.methods.passwordRestToken = function () {
  const token = crypto.randomBytes(64).toString("hex");
  this.RestToken = crypto.createHash("sha256").update(token).digest("hex");
  this.RestTokenExp = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
