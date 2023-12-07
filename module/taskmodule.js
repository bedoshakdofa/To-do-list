const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "there must be a name"],
    tirm: [true],
    minlength: [8, "min length for name is 8"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  content: {
    type: String,

    required: [true],
  },
  checked: {
    type: Boolean,
    default: false,
  },
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
});

const task = mongoose.model("task", taskSchema);
module.exports = task;
