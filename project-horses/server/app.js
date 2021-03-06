const express = require("express");

const app = express();
const port = process.env.PORT || 3001;

const session = require("express-session");

const serveStatic = require("serve-static");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

const passport = require("passport");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/project-horses", {
    useNewUrlParser: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("connected with mongo");
});

app.use(cookieParser());

let sessionMiddleware = session({
    key: "express.sid",
    secret: "session_secret",
    resave: false,
    saveUninitialized: false
});

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(passport.session());

const server = app.listen(port);

const io = require("socket.io").listen(server, {
    log: false,
    agent: false,
    origins: "*:*",
    transports: ["websocket", "htmlfile", "xhr-polling", "jsonp-polling", "polling"]
});

app.use(sessionMiddleware);

app.use(
    cors({
        credentials: true
    })
);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");

    next();
});

const userRouter = require("./routes/user")(io);
const horseRouter = require("./routes/horse")(io);
const judgeRouter = require("./routes/judge")(io);
const classRouter = require("./routes/class")(io);


app.use("/user", userRouter);
app.use("/horse", horseRouter);
app.use("/judge", judgeRouter);
app.use("/class", classRouter);

app.use(serveStatic("public"));
