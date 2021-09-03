const session = require("express-session");
const firebase = require("./Config/fire-admin");
const express = require("express");
const studentRoutes = require("./Routes/student");
const staffRoutes = require("./Routes/staff");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const FirebaseStore = require("connect-session-firebase")(session);
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    method: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
const SessionDB = new FirebaseStore({
  database: firebase.database(),
});

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: SessionDB,
    cookie: {
      name: "auth",
      maxAge: 60 * 60 * 24 * 5 * 1000,
    },
  })
);

app.use("/student", studentRoutes);

app.use("/staff", staffRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on PORT:${PORT}`));
