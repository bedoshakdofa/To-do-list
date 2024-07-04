const User = require("../models/usermodule");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchasync");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("./../utils/AppError");
const Email = require("./../utils/email");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: "90d",
    });
};

const createSendCookie = (user, status, res) => {
    const token = signToken(user._id);
    const cookieOption = {
        expiresIn: new Date(
            Date.now() + process.env.JWT_EXP_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOption.secure = true;
    res.cookie("jwt", token, cookieOption);
    user.password = undefined;
    res.status(status).json({
        status: "success",
        data: {
            token,
            user,
        },
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
    const token = newuser.RandomToken();
    newuser.save({ validateBeforeSave: false });
    const URL = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/users//confirmEmail/${token}`;
    try {
        await new Email(newuser, URL).Send(
            "confirm your email",
            "emailconfirm"
        );
        res.status(200).json({
            status: "success",
            message: "your email has been sent check your inbox",
        });
    } catch (err) {
        await newuser.deleteOne();
        return next(
            new AppError(
                "there was error in sending this email plz try later!!!!",
                500
            )
        );
    }
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
    const token = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({ Token: token });
    if (!user) return next(new AppError(404, "this user is not found"));
    user.active = true;
    user.Token = undefined;
    user.TokenExp = undefined;
    await user.save({ validateBeforeSave: false });
    res.redirect("https://gamgom29.github.io/My-Tasks/login");
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError("please provide an email and password", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.CheckPassword(password, user.password)))
        return next(new AppError("invaild email or password", 400));

    createSendCookie(user, 200, res);
});

exports.LogOut = (req, res) => {
    const cookieOption = {
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") {
        cookieOption.secure = true;
    }
    res.clearCookie("jwt", cookieOption);
    res.status(200).json({
        status: "success",
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    //fisrt seek for token in request
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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
    const otp = currantuser.generateOTP();
    await currantuser.save({ validateBeforeSave: false });
    //creating our url
    try {
        await new Email(currantuser, otp).Send("password Rest", "passowrdrest");
        res.status(200).json({
            status: "success",
            message: "token has been sent succssfully",
        });
    } catch (err) {
        console.log(`this is error :${err}`);
        currantuser.OTP = undefined;
        currantuser.OTPExp = undefined;
        await currantuser.save({ validateBeforeSave: false });
        return next(
            new AppError(
                "there was error in sending this email plz try later!!!!",
                500
            )
        );
    }
});

exports.restpassword = catchAsync(async (req, res, next) => {
    const currantuser = await User.findOne({
        OTP: req.body.OTP,
        OTPExp: { $gte: Date.now() },
    });

    if (!currantuser) {
        return next(new AppError("invaild token or expired", 400));
    }
    //set the new password
    currantuser.password = req.body.password;
    currantuser.passwordConfirm = req.body.passwordConfirm;
    currantuser.OTP = undefined;
    currantuser.OTPExp = undefined;
    await currantuser.save();
    //send the jwt token
    createSendCookie(currantuser, 200, res);
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
    createSendCookie(currantuser, 200, res);
});

exports.getMe = catchAsync(async (req, res) => {
    const Me = await User.findById(req.user.id);
    res.status(200).json({
        status: "success",
        data: {
            user: Me,
        },
    });
});
