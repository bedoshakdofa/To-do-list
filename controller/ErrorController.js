const AppError = require("./../utils/AppError");

const handlevalidationerr = (err) => {
  const msg = Object.values(err.errors).map((el) => el.message);
  return new AppError(`invaild input ${msg.join(". ")}`, 400);
};

const handlecasterr = (err) => {
  return new AppError(`invaild ${err.value} for ${err.path}`, 400);
};

const handleJWTExp = () => {
  return new AppError("your login has expired plz login again", 400);
};

const handleJWTErorr = () => {
  return new AppError("invaild token plz login again ", 400);
};
const Errordev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    statck: err.stack,
    message: err.message,
    error: err,
  });
};

const Errorprod = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "err";
  if (process.env.NODE_ENV === "development") {
    Errordev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") {
      err = handlevalidationerr(err);
    } else if (err.name === "CastError") {
      err = handlecasterr(err);
    } else if (err.name === "TokenExpiredError") {
      err = handleJWTExp();
    } else if (err.name === "JsonWebTokenError") {
      err = handleJWTErorr();
    }
    Errorprod(err, res);
  }
};
