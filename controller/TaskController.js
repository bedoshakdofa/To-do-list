//const user = require("../models/usermodule");
const task = require("../models/taskmodule");
const catchAsync = require("./../utilits/catchasync");
const AppError = require("./../utilits/AppError");

exports.createTask = catchAsync(async (req, res) => {
    const list = await task.create({
        name: req.body.name,
        content: req.body.content,
        checked: req.body.checked,
        userID: req.user.id,
    });
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
    let query = task.find({ userID: req.user.id }).skip(skip).limit(limit);
    const tasks = await query;
    res.status(200).json({
        status: "success",
        data: {
            list: tasks,
        },
    });
});

exports.getOneTask = catchAsync(async (req, res, next) => {
    let query = task.findById(req.params.id).populate("userID");
    const tasks = await query;
    if (!tasks) {
        return next(new AppError(404, "your task not found"));
    }
    res.status(200).json({
        status: "success",
        data: {
            tasks,
        },
    });
});

exports.deleteTask = catchAsync(async (req, res) => {
    const list = await task.findByIdAndDelete(req.params.id);
    if (!list) return new AppError(`this id not found `, 404);
    res.status(200).json({
        status: "success",
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

exports.searchtasks = catchAsync(async (req, res, next) => {
    let query;
    if (req.query.search) {
        query = {
            $and: [
                { userID: { $eq: req.user.id } },
                { name: { $regex: req.query.search } },
            ],
        };
    }
    const list = await task.find(query);
    res.status(200).json({
        status: "sucess",
        data: {
            list,
        },
    });
});
