const session = require("express-session");
const firebase = require("./Config/fire-admin");
const express = require("express");
const studentRoutes = require("./Routes/student");
const staffRoutes = require("./Routes/staff");
const managementRoutes = require("./Routes/management");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const FirebaseStore = require("connect-session-firebase")(session);
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://klvien.moganesan.tech/",
      "https://klvien-staffs.moganesan.tech",
    ],
    method: ["GET", "POST"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
//d
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
const SessionDB = new FirebaseStore({
  database: firebase.database(),
});

if (process.env.NODE_ENV == "production") {
  app.set("trust proxy", 4);
}
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: SessionDB,
    name: "auth",
    cookie: {
      httpOnly: process.env.NODE_ENV == "production" ? true : false,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 5 * 1000,
    },
  })
);

app.get("/", (req, res) => {
  res.send(`Server Running On PORT: ${PORT}`);
});

app.use("/student", studentRoutes);

app.use("/staff", staffRoutes);

app.use("/management", managementRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on PORT:${PORT}`));
