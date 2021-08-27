const router = require("express").Router();
const {
  loginAccount,
  googleLogin,
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

const validate = async (req, res, next) => {
  if (req.session.auth) {
    const email = req.session.auth[0].logindetails.email;

    const data = await firebase
      .firestore()
      .collection("students")
      .doc(email)
      .get()
      .then((res) => res.data());

    const response = [
      {
        logindetails: {
          StudId: data.StudId,
          InId: data.InId,
          SemId: data.SemId,
          profile: data.profile,
          DepId: data.DepId,
          type: data.type,
          name: data.Name,
          email: data.Email,
        },
        student: {
          fname: data.Name,
          lname: data.last_name,
          gender: data.sex,
          dob: data.dob,
          fatname: data.father_name,
          depname: data.dep_name,
          motname: data.mother_name,
          religion: data.religion,
          profile: data.profile,
          blood_group: data.blood_group,
          mobile1: data.contact_mobile,
          mobile2: data.contact_mobile2,
          address1: data.contact_address1,
          address2: data.contact_address2,
          address3: data.contact_address3,
          pincode: data.pincode,
          email: data.Email,
          disctrict: data.district,
          state: data.state,
          country: data.country,
          community: data.community,
          admissionNumber: data.admission_number,
          title: data.title,
          age: data.age,
          university: data.university,
          qualification: data.qualification,
        },
      },
    ];

    req.session.auth = response;

    return res.status(200).send({
      status: 200,
      data: response,
      message: "login successful",
    });
  } else {
    next();
  }
};

const checkStudent = async (req, res, next) => {
  const { email } = req.body;
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
  next();
};

router.post("/login", checkStudent, loginAccount);

router.post("/googleLogin", checkStudent, googleLogin);

router.post("/signup", checkStudent, createAccount);

router.get("/verify", validate, (req, res) => {
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
module.exports = router;
