const User = require("./../module/usermodule");
const catchAsync = require("./../utilits/catchasync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utilits/AppError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, {
    expiresIn: "90d",
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newuser = await User.create(req.body);
  const token = signToken(newuser._id);
  res.status(200).json({
    status: "success",
    data: {
      user: newuser,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("please provide an email and password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.CheckPassword(password, user.password)))
    return next(new AppError("invaild email or password", 400));

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
