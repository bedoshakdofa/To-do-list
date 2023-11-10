const express = require("express");
const usercontrol = require("./../controller/UserController");
const router = express.Router();

router.post("/signup", usercontrol.signup);
router.post("/login", usercontrol.login);
module.exports = router;
