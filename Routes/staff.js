const router = require("express").Router();
const {
  checkStaff,
  loginAccount,
  googleLogin,
  createAccount,
  Verify,
  GetSubjects,
  GetStudents,
  CreateStudent,
  UpdateStudent,
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
  GetStudentsAttendance,
  GetStudentsAssignments,
  CreateAssignment,
} = require("../Controllers/staffController");
const firebase = require("../Config/fire-admin");
const upload = require("express-fileupload");

router.use(upload());

router.post("/login", checkStaff, loginAccount);

router.post("/googleLogin", checkStaff, googleLogin);

router.post("/signup", checkStaff, createAccount);

router.get("/verify", Verify, (req, res) => {
  console.log(req.session);
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

router.post("/students/attendance", GetStudentsAttendance);

router.post("/students/assignments", GetStudentsAssignments);

router.post("/students/assignment/create", CreateAssignment);

router.post("/exams", GetExams);

router.post("/classes", GetClasses);

router.post("/student/uploadprofile", UploadProfile);

router.get("/student/getprofile/:path", GetStudentProfile);

router.post("/student/update", UpdateStudent);

router.post("/student/create", CreateStudent);

module.exports = router;
