const express = require("express");
const taskController = require("../controller/TaskController");
const userController = require("./../controller/UserController");
const Router = express.Router();

Router.use(userController.protect);
Router.route("/")
    .post(taskController.createTask)
    .get(taskController.getAllTask);

Router.route("/:id")
    .get(taskController.getOneTask)
    .delete(taskController.deleteTask)
    .patch(taskController.updateTask);

Router.route("/search").post(taskController.searchtasks);
module.exports = Router;
