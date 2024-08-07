const express = require("express");
const morgan = require("morgan");
const AppErorr = require("./utils/AppError");
const Error = require("./controller/ErrorController");
const userRouter = require("./Router/UserRouter");
const tasklist = require("./Router/taskrouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(cors());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", tasklist);

app.all("*", (req, res, next) => {
    next(new AppErorr(`can't find this url ${req.originalUrl}`, 400));
});

app.use(Error);

module.exports = app;
