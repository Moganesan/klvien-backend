const router = require("express").Router();
const {
  checkStaff,
  loginAccount,
  googleLogin,
  createAccount,
  Verify,
  GetSubjects,
  GetStudents,
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
  GetAssignments,
  UploadProfile,
  GetStudentProfile,
} = require("../Controllers/staffController");
const firebase = require("../Config/fire-admin");
const upload = require("express-fileupload");

router.use(upload());

router.post("/login", checkStaff, loginAccount);

router.post("/googleLogin", checkStaff, googleLogin);

router.post("/signup", checkStaff, createAccount);

router.get("/verify", Verify, (req, res) => {
  return res.status(401).send({
    status: 401,
    data: null,
    message: "Unothorized request plese login",
  });
});

router.get("/signout", (req, res) => {
  req.session.destroy();
  return res.status(200).send({
    status: 200,
    data: null,
    message: "session destroyed",
  });
});

router.post("/subjects", GetSubjects);

router.post("/students", GetStudents);

router.post("/assignments", GetAssignments);

router.post("/exams", GetExams);

router.post("/classes", GetClasses);

router.post("/student/uplodprofile", UploadProfile);

router.get("/student/getprofile/:path", GetStudentProfile);

module.exports = router;
