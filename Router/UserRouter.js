const express = require("express");
const usercontrol = require("./../controller/UserController");
const router = express.Router();

router.post("/signup", usercontrol.signup);
router.post("/login", usercontrol.login);
router.patch("/confirmEmail/:Email", usercontrol.confirmEmail);
router.post("/forgetpassword", usercontrol.forgetpassword);
router.patch("/restpassword/:token", usercontrol.restpassword);
router.patch(
  "/updatepassword",
  usercontrol.protect,
  usercontrol.UpdatePassword
);
module.exports = router;
