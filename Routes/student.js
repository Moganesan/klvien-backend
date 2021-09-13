const router = require("express").Router();
const {
  loginAccount,
  googleLogin,
  verify,
  createAccount,
  GetAttendance,
  GetAssignment,
  UploadAssignment,
  GetExams,
  UploadExam,
  GetHolidays,
  GetClasses,
  AddAttendance,
  GetBillings,
  AddFeedBack,
  GetProfile,
} = require("../Controllers/studentController");
const firebase = require("../Config/fire-admin");
const upload = require("express-fileupload");

router.use(upload());

const checkStudent = async (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const data = await firebase
      .firestore()
      .collection("students")
      .doc(email.trim())
      .get();
    if (!data.exists) {
      return res.status(404).send({
        status: 404,
        data: null,
        message: "student not found!",
      });
    }
  } else {
    return res.status(404).send({
      status: 404,
      data: null,
      message: "student not found!",
    });
  }
  next();
};

router.post("/login", checkStudent, loginAccount);

router.post("/googleLogin", checkStudent, googleLogin);

router.post("/signup", checkStudent, createAccount);

router.get("/verify", verify, (req, res) => {
  return res.status(401).send({
    status: 401,
    data: null,
    message: "Unothorized request plese login",
  });
});

router.get("/signout", (req, res) => {
  console.log("true");
  req.session.destroy();
  return res.status(200).send({
    status: 200,
    data: null,
    message: "session destroyed",
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

router.post("/billings", GetBillings);

router.post("/feedback/add", AddFeedBack);

router.get("/getprofile/:path", GetProfile);

module.exports = router;
