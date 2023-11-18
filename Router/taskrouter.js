const express = require("express");
const taskController = require("../controller/TaskController");
const userController = require("./../controller/UserController");
const Router = express.Router();

Router.route("/")
  .post(userController.protect, taskController.createTask)
  .get(userController.protect, taskController.getAllTask);

Router.route("/:id")
  .delete(userController.protect, taskController.deleteTask)
  .patch(userController.protect, taskController.updateTask);
module.exports = Router;
