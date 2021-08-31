const firebase = require("../Config/fire-admin");

const checkStaff = async (req, res, next) => {
  const { email } = req.body;
  const data = await firebase
    .firestore()
    .collection("staffs")
    .doc(email.trim())
    .get();
  if (!data.exists) {
    return res.status(404).send({
      status: 404,
      data: null,
      message: "staff not found!",
    });
  }
  next();
};

const loginAccount = async (req, res, next) => {
  try {
    if (req.headers?.authorization?.startsWith("Bearer ")) {
      const IdToken = req.headers.authorization.split("Bearer ")[1];
      await firebase
        .auth()
        .verifyIdToken(IdToken)
        .then(async (decodedToken) => {
          const email = decodedToken.email;
          const data = await firebase
            .firestore()
            .collection("staffs")
            .doc(email)
            .get()
            .then((res) => res.data());

          const filterOptions = await Promise.all(
            data.DepId.map(async (depId) => {
              const serverCall = await firebase
                .firestore()
                .collection("institutions")
                .doc(data.InId)
                .collection("departments")
                .doc(depId)
                .get()
                .then((res) => res.data())
                .then(async (res) => {
                  const depData = [res];
                  const semData = [];
                  await Promise.all(
                    data.SemId.map(async (semId) => {
                      await firebase
                        .firestore()
                        .collection("institutions")
                        .doc(data.InId)
                        .collection("departments")
                        .doc(depId)
                        .collection("semesters")
                        .doc(semId)
                        .get()
                        .then((res) => {
                          semData.push(res.data());
                        });
                    })
                  );
                  return {
                    depData,
                    semData,
                  };
                });
              return serverCall;
            })
          );

          const response = [
            {
              logindetails: {
                StafId: data.StaffId,
                InId: data.InId,
                SemId: data.SemId,
                SemData: filterOptions[0].semData,
                filtSem: filterOptions[0].semData.map((sem) => sem.name),
                profile: data.profile,
                DepId: data.DepId,
                DepData: filterOptions[0].depData,
                filtDep: filterOptions[0].depData.map((dep) => dep.name),
                type: data.type,
                fname: data.firstName,
                lname: data.lastName,
                email: data.email,
                Gauth: data.googleAuth,
              },
              staff: {
                fname: data.firstName,
                lname: data.lastName,
                gender: data.sex,
                dob: data.dob.toDate().toDateString(),
                religion: data.religion,
                profile: data.profile,
                blood_group: data.blood_group,
                mobile1: data.contact_mobile1,
                mobile2: data.contact_mobile2,
                address1: data.contact_address1,
                address2: data.contact_address2,
                address3: data.contact_address3,
                pincode: data.pincode,
                email: data.email,
                disctrict: data.district,
                state: data.state,
                country: data.country,
                community: data.community,
                title: data.title,
                age: data.age,
                qualification: data.qualification,
              },
            },
          ];
          req.session.auth = response;
          return res.status(200).send({
            status: 200,
            data: response[0],
            message: "login successful",
          });
        });
    } else {
      return res.status(403).send({
        status: 403,
        error: {
          code: "authError",
          message:
            "The authorization credentials provided for the request are invalid. Check the value of the Authorization HTTP request header.",
        },
      });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
  next();
};

const googleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collection("staffs")
      .doc(email)
      .get()
      .then((res) => res.data());

    if (!data.googleAuth) {
      return res.status(403).send({
        status: 403,
        data: null,
        message: "student not found!",
      });
    }

    const filterOptions = await Promise.all(
      data.DepId.map(async (depId) => {
        const serverCall = await firebase
          .firestore()
          .collection("institutions")
          .doc(data.InId)
          .collection("departments")
          .doc(depId)
          .get()
          .then((res) => res.data())
          .then(async (res) => {
            const depData = [res];
            const semData = [];
            await Promise.all(
              data.SemId.map(async (semId) => {
                await firebase
                  .firestore()
                  .collection("institutions")
                  .doc(data.InId)
                  .collection("departments")
                  .doc(depId)
                  .collection("semesters")
                  .doc(semId)
                  .get()
                  .then((res) => {
                    semData.push(res.data());
                  });
              })
            );
            return {
              depData,
              semData,
            };
          });
        return serverCall;
      })
    );

    const response = [
      {
        logindetails: {
          StafId: data.StaffId,
          InId: data.InId,
          SemId: data.SemId,
          SemData: filterOptions[0].semData,
          filtSem: filterOptions[0].semData.map((sem) => sem.name),
          profile: data.profile,
          DepId: data.DepId,
          DepData: filterOptions[0].depData,
          filtDep: filterOptions[0].depData.map((dep) => dep.name),
          type: data.type,
          fname: data.firstName,
          lname: data.lastName,
          email: data.email,
          Gauth: data.googleAuth,
        },
        staff: {
          fname: data.firstName,
          lname: data.lastName,
          gender: data.sex,
          dob: data.dob.toDate().toDateString(),
          religion: data.religion,
          profile: data.profile,
          blood_group: data.blood_group,
          mobile1: data.contact_mobile1,
          mobile2: data.contact_mobile2,
          address1: data.contact_address1,
          address2: data.contact_address2,
          address3: data.contact_address3,
          pincode: data.pincode,
          email: data.email,
          disctrict: data.district,
          state: data.state,
          country: data.country,
          community: data.community,
          title: data.title,
          age: data.age,
          qualification: data.qualification,
        },
      },
    ];
    req.session.auth = response;
    return res.status(200).send({
      status: 200,
      data: response[0],
      message: "login successful",
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const createAccount = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await auth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => response.user);
    await auth.signOut();
    return res
      .status(200)
      .send({ status: 200, data: user, message: "success" });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const Verify = async (req, res, next) => {
  if (req.session.auth) {
    const email = req.session.auth[0].logindetails.email;
    console.log(email);

    const data = await firebase
      .firestore()
      .collection("staffs")
      .doc(email)
      .get()
      .then((res) => res.data());

    const filterOptions = await Promise.all(
      data.DepId.map(async (depId) => {
        const serverCall = await firebase
          .firestore()
          .collection("institutions")
          .doc(data.InId)
          .collection("departments")
          .doc(depId)
          .get()
          .then((res) => res.data())
          .then(async (res) => {
            const depData = [res];
            const semData = [];
            await Promise.all(
              data.SemId.map(async (semId) => {
                await firebase
                  .firestore()
                  .collection("institutions")
                  .doc(data.InId)
                  .collection("departments")
                  .doc(depId)
                  .collection("semesters")
                  .doc(semId)
                  .get()
                  .then((res) => {
                    semData.push(res.data());
                  });
              })
            );
            return {
              depData,
              semData,
            };
          });
        return serverCall;
      })
    );

    const response = [
      {
        logindetails: {
          StafId: data.StaffId,
          InId: data.InId,
          SemId: data.SemId,
          SemData: filterOptions[0].semData,
          filtSem: filterOptions[0].semData.map((sem) => sem.name),
          profile: data.profile,
          DepId: data.DepId,
          DepData: filterOptions[0].depData,
          filtDep: filterOptions[0].depData.map((dep) => dep.name),
          type: data.type,
          fname: data.firstName,
          lname: data.lastName,
          email: data.email,
          Gauth: data.googleAuth,
        },
        staff: {
          fname: data.firstName,
          lname: data.lastName,
          gender: data.sex,
          dob: data.dob.toDate().toDateString(),
          religion: data.religion,
          profile: data.profile,
          blood_group: data.blood_group,
          mobile1: data.contact_mobile1,
          mobile2: data.contact_mobile2,
          address1: data.contact_address1,
          address2: data.contact_address2,
          address3: data.contact_address3,
          pincode: data.pincode,
          email: data.email,
          disctrict: data.district,
          state: data.state,
          country: data.country,
          community: data.community,
          title: data.title,
          age: data.age,
          qualification: data.qualification,
        },
      },
    ];
    req.session.auth = response;
    return res.status(200).send({
      status: 200,
      data: response[0],
      message: "login successful",
    });
  } else {
    next();
  }
};

const GetSubjects = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collection(
        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
      )
      .get()
      .then((res) =>
        res.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        })
      );
    if (!data.length) {
      return res.status(404).send({
        status: 404,
        err: "not found!",
      });
    }
    return res.status(200).send({
      status: 200,
      data: data.map((obj) => ({
        _id: obj.id,
        subName: obj.subName,
        subCategory: obj.subCategory,
        subIcon: obj.subIcon,
        crBy: obj.crBy,
        crAt: obj.crAt.toDate().toDateString(),
      })),
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

module.exports = {
  checkStaff,
  loginAccount,
  googleLogin,
  createAccount,
  Verify,
  GetSubjects,
};
