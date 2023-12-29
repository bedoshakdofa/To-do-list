const User = require("../models/usermodule");
const { promisify } = require("util");
const catchAsync = require("./../utilits/catchasync");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("./../utilits/AppError");
const sendEmail = require("./../utilits/email");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "90d",
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newuser = await User.create({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        gender: req.body.gender,
    });

    const URL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/users/confirmEmail/${newuser.email}`;
    const message = `validate your Email 
  click on this link to activate your account: ${URL}.`;

    try {
        await sendEmail({
            email: newuser.email,
            subject: "confirm your account",
            message,
        });

        res.status(200).json({
            status: "success",
            message: "your email has been sent check your inbox",
        });
    } catch (err) {
        await User.deleteOne({ email: newuser.email });
        return next(
            new AppError(
                "there was error in sending this email plz try later!!!!",
                500
            )
        );
    }
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
    const currantuser = await User.findOne({ email: req.params.Email });

    if (!currantuser) {
        return next(new AppError("your are not signup plz signup", 401));
    }
    currantuser.active = true;
    await currantuser.save({ validateBeforeSave: false });

    const token = signToken(currantuser._id);
    res.status(200).json({
        status: "success",
        token,
        data: {
            name: currantuser.name,
            email: currantuser.email,
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
        return next(
            new AppError("you have change your password recently ", 401)
        );
    }
    req.user = currantuser;
    next();
});

exports.forgetpassword = catchAsync(async (req, res, next) => {
    const currantuser = await User.findOne({ email: req.body.email });
    //check if the enterd email is exist in our database
    if (!currantuser) {
        return next(new AppError("no user found with this email ", 404));
    }
    //genrate password rest token
    const rest_token = currantuser.passwordRestToken();
    currantuser.save({ validateBeforeSave: false });
    //creating our url
    const URL = `${req.protocol}://${req.get(
        "host"
    )}/ap1/v1/users/restpassword/${rest_token}`;
    //message
    const message = `Forgot your password? 
  Submit a PATCH request with your new password and passwordConfirm to: ${URL}.
  \nIf you didn't forget your password, please ignore this email!`;
    //send the password rest token in email

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
        currantuser.RestToken = undefined;
        currantuser.RestTokenExp = undefined;
        currantuser.save({ validateBeforeSave: false });
        return next(
            new AppError(
                "there was error in sending this email plz try later!!!!",
                500
            )
        );
    }
});

exports.restpassword = catchAsync(async (req, res, next) => {
    //hashed the recived token
    const hashedtoken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    //find the user depand on the token
    const currantuser = await User.findOne({
        RestToken: hashedtoken,
        RestTokenExp: { $gte: Date.now() },
    });

    if (!currantuser) {
        return next(new AppError("invaild token or expired", 400));
    }
    //set the new password
    currantuser.password = req.body.password;
    currantuser.passwordConfirm = req.body.passwordConfirm;
    currantuser.RestToken = undefined;
    currantuser.RestTokenExp = undefined;
    await currantuser.save();
    //send the jwt token
    const token = signToken(currantuser._id);
    res.status(200).json({
        status: "success",
        token,
    });
});

exports.UpdatePassword = catchAsync(async (req, res, next) => {
    const currantuser = await User.findById(req.user.id).select("+password");

    if (
        !(await currantuser.CheckPassword(
            req.body.passwordCurrant,
            currantuser.password
        ))
    ) {
        return next(new AppError("password does not match ", 404));
    }

    currantuser.password = req.body.password;
    currantuser.passwordConfirm = req.body.passwordConfirm;
    await currantuser.save();
    const token = signToken(currantuser._id);
    res.status(200).json({
        status: "success",
        token,
        data: {
            currantuser,
        },
    });
});
