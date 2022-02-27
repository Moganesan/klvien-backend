const firebase = require("../Config/fire-admin");

const loginAccount = async () => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    try {
      const IdToken = req.headers.authorization.split("Bearer ")[1];
      const decodedToken = await firebase
        .auth()
        .verifyIdToken(IdToken)
        .then(async (decodedToken) => decodedToken);
      try {
        const email = decodedToken.email;

        await firebase.firestore().runTransaction(async (t) => {
          const staffData = await t
            .get(firebase.firestore().collection("staffs").doc(email.trim()))
            .then((res) => res.data());

          const filterOptions = await Promise.all(
            staffData.DepId.map(async (DepId) => {
              const serverCalls = await t
                .get(
                  firebase
                    .firestore()
                    .collection("institutions")
                    .doc(staffData.InId)
                    .collection("departments")
                    .doc(DepId)
                )
                .then(async (res) => {
                  const depData = [];
                  depData.push(res.data());
                  const semData = [];
                  await Promise.all(
                    staffData.SemId.map(async (SemId) => {
                      await t
                        .get(
                          firebase
                            .firestore()
                            .collection("institutions")
                            .doc(staffData.InId)
                            .collection("departments")
                            .doc(DepId)
                            .collection("semesters")
                            .doc(SemId)
                        )
                        .then((res) => {
                          semData.push(res.data());
                        });
                    })
                  );
                  return { depData, semData };
                });
              return serverCalls;
            })
          );

          const response = [
            {
              logindetails: {
                StafId: staffData.StaffId,
                InId: staffData.InId,
                SemId: staffData.SemId,
                SemData: filterOptions[0].semData,
                filtSem: filterOptions[0].semData.map((sem) => sem.name),
                profile: staffData.profile,
                DepId: staffData.DepId,
                DepData: filterOptions[0].depData,
                filtDep: filterOptions[0].depData.map((dep) => dep.name),
                type: staffData.type,
                fname: staffData.firstName,
                lname: staffData.lastName,
                email: staffData.email,
                Gauth: staffData.googleAuth,
              },
              staff: {
                fname: staffData.firstName,
                lname: staffData.lastName,
                gender: staffData.sex.toUpperCase(),
                dob: staffData.dob.toDate().toDateString(),
                religion: staffData.religion,
                profile: staffData.profile,
                blood_group: staffData.blood_group,
                mobile1: staffData.contact_mobile1,
                mobile2: staffData.contact_mobile2,
                address1: staffData.contact_address1,
                address2: staffData.contact_address2,
                address3: staffData.contact_address3,
                pincode: staffData.pincode,
                email: staffData.email,
                disctrict: staffData.district,
                state: staffData.state,
                country: staffData.country,
                community: staffData.community,
                title: staffData.title,
                age: staffData.age,
                qualification: staffData.qualification,
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
      } catch (e) {
        return res.status(500).send({ status: 500, error: err });
      }
    } catch (err) {
      return res.status(403).send({ status: 403, error: err });
    }
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
  next();
};

module.exports = {
  loginAccount,
};
