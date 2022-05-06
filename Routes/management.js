const router = require("express").Router();
const { loginAccount } = require("../Controllers/managementController");

// router.post("/login", checkStaff, loginAccount);

// router.post("/googleLogin", checkStaff, googleLogin);

// router.post("/signup", checkStaff, createAccount);

// router.get("/verify", Verify, (req, res) => {
//   console.log(req.session);
//   return res.status(401).send({
//     status: 401,
//     data: null,
//     message: "Unothorized request plese login",
//   });
// });

// router.get("/signout", (req, res) => {
//   req.session.destroy();
//   return res.status(200).send({
//     status: 200,
//     data: null,
//     message: "session destroyed",
//   });
// });
