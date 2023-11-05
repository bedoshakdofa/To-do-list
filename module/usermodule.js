const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
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
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
const User = mongoose.model("user", userSchema);
module.exports = User;
