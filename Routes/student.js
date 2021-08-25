const router = require("express").Router();
const {
  loginAccount,
  createAccount,
  GetAttendance,
  GetAssignment,
  UploadAssignment,
  GetExams,
  UploadExam,
  GetHolidays,
  GetClasses,
  AddAttendance,
} = require("../Controllers/studentController");
const firebase = require("../Config/fire-admin");
const upload = require("express-fileupload");

router.use(upload());

const validateLogin = async (req, res, next) => {
  if (req.session.auth) {
    return res.status(200).send({
      status: 200,
      data: req.session.auth,
      message: "already login!",
    });
  }
  if (!req.session.auth) {
    next();
  }
};

const validate = (req, res, next) => {
  if (req.session.auth) {
    return res.status(200).send({
      status: 200,
      data: req.session.auth,
      message: "already login",
    });
  } else {
    next();
  }
};

const checkStudent = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).send({ error: "missing email" });
  if (!password) return res.status(400).send({ error: "missing password" });
  const data = await firebase
    .firestore()
    .collection("students")
    .doc(email)
    .get();
  if (!data.exists) {
    return res.status(404).send({
      status: 404,
      data: null,
      message: "student not found!",
    });
  }
  next();
};

router.post("/login", checkStudent, loginAccount);

router.post("/signup", checkStudent, createAccount);

router.get("/verify", validate, (req, res) => {
  return res.status(401).send({
    status: 401,
    data: null,
    message: "Unothorized request plese login",
  });
});

router.post("/attendance", GetAttendance);

router.post("/assignments", GetAssignment);

router.post("/assignments/upload", UploadAssignment);

router.post("/exams", GetExams);

router.post("/exams/upload", UploadExam);

router.post("/holidays", GetHolidays);

router.post("/classes", GetClasses);

router.post("/attendance/add", AddAttendance);

module.exports = router;
