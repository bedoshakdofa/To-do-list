const express = require("express");
const usercontrol = require("./../controller/UserController");
const router = express.Router();

router.post("/sginup", usercontrol.signup);
router.post("/login", usercontrol.login);
router.post('/logout',usercontrol.LogOut)
router.patch("/confirmEmail/:token", usercontrol.confirmEmail);
router.post("/forgetpassword", usercontrol.forgetpassword);
router.patch("/restpassword/:token", usercontrol.restpassword);
router.use(usercontrol.protect)
router.patch(
    "/updatepassword",
    usercontrol.UpdatePassword
);
router.get('/Me',usercontrol.getMe)
module.exports = router;
