const express = require("express");
const usercontrol = require("./../controller/UserController");
const router = express.Router();

router.post("/signup", usercontrol.signup);

module.exports = router;
