const task = require("./../module/taskmodule");
const catchAsync = require("./../utilits/catchasync");
const AppError = require("./../utilits/AppError");

exports.createTask = catchAsync(async (req, res) => {
  const list = await task.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      list,
    },
  });
});

exports.getAllTask = catchAsync(async (req, res) => {
  const limit = req.query.limit * 1 || 9;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  let query = task.find().skip(skip).limit(limit);
  const tasks = await query;
  res.status(200).json({
    status: "success",
    data: {
      list: tasks,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res) => {
  const list = await task.deleteOne(req.params.id);
  if (!list) return new AppError(`this id not found `, 404);
  res.status(200).json({
    status: "success",
    data: {
      list,
    },
  });
});

exports.updateTask = catchAsync(async (req, res) => {
  const list = await task.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!list) return new AppError(`this id not found `, 404);
  res.status(200).json({
    status: "success",
    data: {
      list,
    },
  });
});
