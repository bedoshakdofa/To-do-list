const express = require("express");
const taskController = require("../controller/TaskController");
const Router = express.Router();

Router.route("/")
  .post(taskController.createTask)
  .get(taskController.getAllTask);

Router.route("/:id")
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);
module.exports = Router;
