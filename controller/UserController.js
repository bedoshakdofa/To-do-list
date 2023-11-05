const User = require("./../module/usermodule");
const catchAsync = require("./../utilits/catchasync");
exports.signup = catchAsync(async (req, res) => {
  const newuser = await User.create(req.body);
  res.status(200).json({
    status: "success",
    user: newuser,
  });
});
