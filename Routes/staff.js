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
  CreateClass,
  AddAttendance,
  GetBillings,
  AddFeedBack,
  GetAssignments,
  UploadProfile,
  GetStudentProfile,
  GetStudentsAttendance,
  GetStudentsAssignments,
  CreateAssignment,
  CreateExam,
  CreateHolidays,
  UpdateClass,
  AddStudentAttendance,
  CreateSubject,
  GetStudentAssignment,
  UpdateAssignmentStatus,
  UpdateExamStatus,
  GetExam,
  GetRecentStudentsLogins,
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

router.post("/subjects/create", CreateSubject);

router.post("/students", GetStudents);

router.post("/students/recentlogins", GetRecentStudentsLogins);

router.post("/students/attendance", GetStudentsAttendance);

router.post("/students/assignments", GetStudentsAssignments);

router.post("/students/assignment/create", CreateAssignment);

router.post("/students/exams", GetExams);

router.post("/students/exams/create", CreateExam);

router.post("/students/holidays", GetHolidays);

router.post("/students/holidays/create", CreateHolidays);

router.post("/students/classes", GetClasses);

router.post("/students/classes/create", CreateClass);

router.post("/students/classes/update", UpdateClass);

router.post("/students/classes/addattendance", AddStudentAttendance);

router.post("/students/assignments/updatestatus", UpdateAssignmentStatus);

router.post("/students/exams/updatestatus", UpdateExamStatus);

router.post("/student/uploadprofile", UploadProfile);

router.get("/student/getprofile/:path", GetStudentProfile);

router.get("/student/getassignment/:path", GetStudentAssignment);

router.get("/student/getexam/:path", GetExam);

router.post("/student/update", UpdateStudent);

router.post("/student/create", CreateStudent);

router.post("/feedback/add", AddFeedBack);

module.exports = router;
