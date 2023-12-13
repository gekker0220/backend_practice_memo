const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const port = process.env.PORT || 3000; // 포트 번호를 환경 변수에서 가져오거나 기본값으로 3000 사용
const db = require("./config/mysql.js");
const helmet = require("helmet");
const csp = require("helmet-csp");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();
const conn = db.init();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const { expressCspHeader, INLINE, NONE, SELF } = require("express-csp-header");
app.use(
  expressCspHeader({
    directives: {
      "script-src": [
        SELF,
        INLINE,
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com",
      ],
    },
  })
);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
