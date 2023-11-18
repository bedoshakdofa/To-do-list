const User = require("./../module/usermodule");
const { promisify } = require("util");
const catchAsync = require("./../utilits/catchasync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utilits/AppError");
const sendEmail = require("./../utilits/email");

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
    token,
    data: {
      name: newuser.name,
      email: newuser.email,
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

exports.protect = catchAsync(async (req, res, next) => {
  //fisrt seek for token in request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //if not found raise an error
  if (!token) {
    return next(new AppError("your are not login please login ", 401));
  }
  //verfify the token we take
  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_TOKEN
  );

  //check if there a user for this token
  const currantuser = await User.findById(decode.id);

  if (!currantuser) {
    return next(new AppError("invaild email or password", 401));
  }
  // check if the user change the password after jwt issued
  if (currantuser.isPasswordChange(decode.iat)) {
    return next(new AppError("you have change your password recently ", 401));
  }
  req.user = currantuser;
  next();
});

exports.forgetpassword = catchAsync(async (req, res, next) => {
  const currantuser = await User.findOne({ email: req.body.email });

  if (!currantuser) {
    return next(new AppError("no user found with this email ", 404));
  }

  const rest_token = currantuser.passwordRestToken();
  currantuser.save({ validateBeforeSave: false });

  const URL = `${req.protocol}://${req.get(
    "host"
  )}/ap1/v1/users/restpassword/${rest_token}`;

  const message = `Forgot your password? 
  Submit a PATCH request with your new password and passwordConfirm to: ${URL}.
  \nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: currantuser.email,
      subject: `password rest link (valid for 10 min)`,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token has been sent succssfully",
    });
  } catch (err) {
    currantuser.rest_Token = undefined;
    currantuser.passowrdTokenEXP = undefined;
    currantuser.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "there was error in sending this email plz try later!!!!",
        500
      )
    );
  }
});

exports.restpassword = catchAsync((req, res, next) => {});
