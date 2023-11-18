const express = require("express");
const usercontrol = require("./../controller/UserController");
const router = express.Router();

router.post("/signup", usercontrol.signup);
router.post("/login", usercontrol.login);

router.post("/forgetpassword", usercontrol.forgetpassword);
router.patch("/restpassword/:token", usercontrol.restpassword);
module.exports = router;
