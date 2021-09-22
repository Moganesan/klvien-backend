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

const googleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    try {
      await firebase.firestore().runTransaction(async (t) => {
        const staffData = await t
          .get(firebase.firestore().collection("staffs").doc(email.trim()))
          .then((res) => res.data());

        if (!staffData.googleAuth) {
          return res.status(403).send({
            status: 403,
            data: null,
            message: "staff not found!",
          });
        }

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

    try {
      await firebase.firestore().runTransaction(async (t) => {
        const staffData = await t
          .get(firebase.firestore().collection("staffs").doc(email.trim()))
          .then((res) => res.data());

        if (!staffData) {
          return res.status(403).send({
            status: 403,
            error: {
              code: "authError",
              message:
                "The authorization credentials provided for the request are invalid. Check the value of the Authorization HTTP request header.",
            },
          });
        }

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
    } catch (err) {
      console.log(err);
      return res.status(500).send({ status: 500, error: err });
    }
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
        err: "subjects not found!",
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
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudents = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collection("students")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
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
        InId: obj.InId.trim(),
        DepId: obj.DepId.trim(),
        SemId: obj.SemId.trim(),
        StudId: obj.StudId.trim(),
        firstName: obj.firstName.trim(),
        lastName: obj.lastName.trim(),
        email: obj.email.trim(),
        gender: obj.gender.trim(),
        profile: obj.profile.trim(),
        bloodGroup: obj.bloodGroup.trim(),
        religion: obj.religion.trim(),
        title: obj.title.trim(),
        country: obj.country.trim(),
        state: obj.state.trim(),
        district: obj.district.trim(),
        contMob: obj.contMob.trim(),
        age: obj.age.trim(),
        qualification: obj.qualification.trim(),
        dob: obj.dob.toDate().toLocaleDateString("sv"),
        pincode: obj.pincode.trim(),
        fathName: obj.fathName.trim(),
        fathOccu: obj.fathOccu.trim(),
        fathMob: obj.fathMob.trim(),
        mothName: obj.mothName.trim(),
        mothOccu: obj.mothOccu.trim(),
        mothMob: obj.mothMob.trim(),
        community: obj.community.trim(),
        institution: {
          name: obj.institution.name,
          email: obj.institution.email,
          address1: obj.institution.address1,
          address2: obj.institution.address2,
          address3: obj.institution.address3,
          country: obj.institution.country,
          state: obj.institution.state,
          district: obj.institution.district,
          postalCode: obj.institution.postalCode,
          phone: obj.institution.phone,
        },
        crAt: obj.crAt.toDate().toDateString(),
        modAt: obj.modAt.toDate().toDateString(),
        depName: obj.depName.trim(),
        googleAuth: obj.googleAuth,
        type: obj.type.trim(),
        semName: obj.semName.trim(),
        contactAddress1: obj.contactAddress1.trim(),
        contactAddress2: obj.contactAddress2.trim(),
        contactAddress3: obj.contactAddress3.trim(),
        addmisNo: obj.addmisNo.trim(),
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudentsAttendance = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        const data = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then(
            async (res) =>
              await Promise.all(
                res.docs.map(async (doc) => {
                  const data = doc.data();
                  const id = doc.id;

                  const attendance = await transaction
                    .get(
                      firebase
                        .firestore()
                        .collectionGroup("attendance")
                        .where("InId", "==", data.InId)
                        .where("DepId", "==", data.DepId.trim())
                        .where("SemId", "==", data.SemId.trim())
                        .where("StudId", "==", data.StudId.trim())
                    )
                    .then(
                      async (res) =>
                        await Promise.all(
                          res.docs.map(async (res) => {
                            const data = res.data();
                            return {
                              ...data,
                              overAllPercentage: parseInt(
                                (data.overAllPrecent / data.overAllPeriods) *
                                  100
                              ),
                              subjects: data.subjectList.map((subject) => ({
                                code: subject.subCode.toString(),
                                name: subject.subName.toString().toUpperCase(),
                                [subject.subName.toString().toUpperCase()]:
                                  parseInt(
                                    (subject.overAllPrecent /
                                      subject.overAllPeriods) *
                                      100
                                  ),
                              })),
                              attendanceLog: data.attendanceLog.map((log) => {
                                const timeDeff = (start, end) => {
                                  var diff = (start - end) / 1000;
                                  diff /= 60;
                                  return Math.abs(Math.round(diff));
                                };
                                return {
                                  subName: log.subName.toUpperCase().trim(),
                                  date: log.date.toDate().toDateString(),
                                  start: log.startingTime
                                    .toDate()
                                    .toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    .toUpperCase(),
                                  end: log.endingTime
                                    .toDate()
                                    .toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    .toUpperCase(),
                                  duration: timeDeff(
                                    log.startingTime.toDate(),
                                    log.endingTime.toDate()
                                  ),
                                  staffName: log.staffName,
                                  status: log.status.toUpperCase().trim(),
                                };
                              }),
                            };
                          })
                        )
                    );
                  return { attendance: attendance, id, ...data };
                })
              )
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
            InId: obj.InId.trim(),
            DepId: obj.DepId.trim(),
            SemId: obj.SemId.trim(),
            StudId: obj.StudId.trim(),
            firstName: obj.firstName.trim(),
            lastName: obj.lastName.trim(),
            email: obj.email.trim(),
            attendance: obj.attendance,
            gender: obj.gender.trim(),
            profile: obj.profile.trim(),
            bloodGroup: obj.bloodGroup.trim(),
            religion: obj.religion.trim(),
            title: obj.title.trim(),
            country: obj.country.trim(),
            state: obj.state.trim(),
            district: obj.district.trim(),
            contMob: obj.contMob.trim(),
            age: obj.age.trim(),
            qualification: obj.qualification.trim(),
            dob: obj.dob.toDate().toLocaleDateString("sv"),
            pincode: obj.pincode.trim(),
            fathName: obj.fathName.trim(),
            fathOccu: obj.fathOccu.trim(),
            fathMob: obj.fathMob.trim(),
            mothName: obj.mothName.trim(),
            mothOccu: obj.mothOccu.trim(),
            mothMob: obj.mothMob.trim(),
            community: obj.community.trim(),
            institution: {
              name: obj.institution.name,
              email: obj.institution.email,
              address1: obj.institution.address1,
              address2: obj.institution.address2,
              address3: obj.institution.address3,
              country: obj.institution.country,
              state: obj.institution.state,
              district: obj.institution.district,
              postalCode: obj.institution.postalCode,
              phone: obj.institution.phone,
            },
            crAt: obj.crAt.toDate().toDateString(),
            modAt: obj.modAt.toDate().toDateString(),
            depName: obj.depName.trim(),
            googleAuth: obj.googleAuth,
            type: obj.type.trim(),
            semName: obj.semName.trim(),
            contactAddress1: obj.contactAddress1.trim(),
            contactAddress2: obj.contactAddress2.trim(),
            contactAddress3: obj.contactAddress3.trim(),
            addmisNo: obj.addmisNo.trim(),
          })),
          items: Object.keys(data).length,
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ status: 500, error: err });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudentsAssignments = async (req, res) => {
  const { InId, DepId, SemId } = req.body;

  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      const data = await transaction
        .get(
          firebase
            .firestore()
            .collection("students")
            .where("InId", "==", InId.trim())
            .where("DepId", "==", DepId.trim())
            .where("SemId", "==", SemId.trim())
        )
        .then(
          async (res) =>
            await Promise.all(
              res.docs.map(async (doc) => {
                const studentData = doc.data();
                const id = doc.id;

                const assignments = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collectionGroup("assignments")
                      .where("InId", "==", studentData.InId)
                      .where("DepId", "==", studentData.DepId.trim())
                      .where("SemId", "==", studentData.SemId.trim())
                      .where("students", "array-contains-any", [
                        studentData.StudId.trim(),
                      ])
                  )
                  .then(
                    async (res) =>
                      await Promise.all(
                        res.docs.map(async (res) => {
                          const data = res.data();
                          const id = res.id;
                          return {
                            AssgId: id.trim(),
                            subject: data.subject,
                            subCode: data.subCode,
                            project: data.project,
                            date: data.date.toDate().toDateString(),
                            dueDate: data.dueDate.toDate().toDateString(),
                            staffName: data.staffName,
                            status: data.studentsStatus
                              .find(
                                (status) =>
                                  status.StudId === studentData.StudId.trim()
                              )
                              ["status"].toUpperCase(),
                            file: data.studentsStatus
                              .find(
                                (file) =>
                                  file.StudId == studentData.StudId.trim()
                              )
                              .file.trim(),
                          };
                        })
                      )
                  );

                const assignmentCompleted = [];

                assignments.map((obj) =>
                  obj.status == "COMPLETED"
                    ? assignmentCompleted.push(obj)
                    : null
                );

                const assignmentChecking = [];

                assignments.map((obj) =>
                  obj.status == "CHECKING" ? assignmentChecking.push(obj) : null
                );

                const assignmentPending = [];

                assignments.map((obj) =>
                  obj.status == "PENDING" ? assignmentPending.push(obj) : null
                );

                const assignmentCompletedPercentage =
                  (assignmentCompleted.length / assignments.length) * 100;

                const assignmentCheckingPercentage =
                  (assignmentChecking.length / assignments.length) * 100;

                const assignmentPendingPercentage =
                  (assignmentPending.length / assignments.length) * 100;

                const subjects = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collection(
                        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
                      )
                  )
                  .then((res) =>
                    res.docs.map((doc) => ({ _id: doc.id, ...doc.data() }))
                  );

                return {
                  assignmentsData: {
                    assignmentCompletedPercentage,
                    assignmentCheckingPercentage,
                    assignmentPendingPercentage,
                    subjectList: subjects.map((subject) => ({
                      SubId: subject._id,
                      subCode: subject.subCode,
                      subName: subject.subName,
                      crAt: subject.crAt,
                      crBy: subject.crBy,
                    })),
                    subjects: subjects.map((subject) => {
                      const totalAssignments = [];
                      assignments.map((obj) =>
                        obj.subCode == subject.subCode
                          ? totalAssignments.push(obj)
                          : null
                      );

                      const assignmentCompleted = [];
                      assignments.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "COMPLETED"
                            ? assignmentCompleted.push(obj)
                            : null
                          : null
                      );
                      const assignmentChecking = [];
                      assignments.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "CHECKING"
                            ? assignmentChecking.push(obj)
                            : null
                          : null
                      );
                      const assignmentPending = [];
                      assignments.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "PENDING"
                            ? assignmentPending.push(obj)
                            : null
                          : null
                      );

                      const assignmentCompletedPercentage =
                        (assignmentCompleted.length / totalAssignments.length) *
                        100;

                      const assignmentCheckingPercentage =
                        (assignmentChecking.length / totalAssignments.length) *
                        100;

                      const assignmentPendingPercentage =
                        (assignmentPending.length / totalAssignments.length) *
                        100;

                      return {
                        subject: subject.subName.toUpperCase(),
                        Completed: assignmentCompleted.length,
                        Checking: assignmentChecking.length,
                        Pending: assignmentPending.length,
                      };
                    }),
                    assignments,
                  },
                  id,
                  ...studentData,
                };
              })
            )
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
          InId: obj.InId.trim(),
          DepId: obj.DepId.trim(),
          SemId: obj.SemId.trim(),
          StudId: obj.StudId.trim(),
          firstName: obj.firstName.trim(),
          lastName: obj.lastName.trim(),
          email: obj.email.trim(),
          assignmentsData: obj.assignmentsData,
          assignmentsCount: obj.assignmentsData.assignments.length,
          gender: obj.gender.trim(),
          profile: obj.profile.trim(),
          bloodGroup: obj.bloodGroup.trim(),
          religion: obj.religion.trim(),
          title: obj.title.trim(),
          country: obj.country.trim(),
          state: obj.state.trim(),
          district: obj.district.trim(),
          contMob: obj.contMob.trim(),
          age: obj.age.trim(),
          qualification: obj.qualification.trim(),
          dob: obj.dob.toDate().toLocaleDateString("sv"),
          pincode: obj.pincode.trim(),
          fathName: obj.fathName.trim(),
          fathOccu: obj.fathOccu.trim(),
          fathMob: obj.fathMob.trim(),
          mothName: obj.mothName.trim(),
          mothOccu: obj.mothOccu.trim(),
          mothMob: obj.mothMob.trim(),
          community: obj.community.trim(),
          institution: {
            name: obj.institution.name,
            email: obj.institution.email,
            address1: obj.institution.address1,
            address2: obj.institution.address2,
            address3: obj.institution.address3,
            country: obj.institution.country,
            state: obj.institution.state,
            district: obj.institution.district,
            postalCode: obj.institution.postalCode,
            phone: obj.institution.phone,
          },
          crAt: obj.crAt.toDate().toDateString(),
          modAt: obj.modAt.toDate().toDateString(),
          depName: obj.depName.trim(),
          googleAuth: obj.googleAuth,
          type: obj.type.trim(),
          semName: obj.semName.trim(),
          contactAddress1: obj.contactAddress1.trim(),
          contactAddress2: obj.contactAddress2.trim(),
          contactAddress3: obj.contactAddress3.trim(),
          addmisNo: obj.addmisNo.trim(),
        })),
        items: Object.keys(data).length,
      });
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudentsList = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const students = await firebase
      .firestore()
      .collection("students")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then((res) => res.docs.map((doc) => doc.data()));
    if (!students) {
      res.status(404).send({
        status: 404,
        data: "Students not found!",
      });

      return req.status(200).send({
        status: 200,
        data: students,
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const GetAssignmentsList = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const assignments = await firebase
      .firestore()
      .collectionGroup("assignments")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then((res) => res.docs.map((doc) => doc.data()));

    if (!assignments) {
      res.status(404).send({
        status: 404,
        data: "assignments not found",
      });
    }

    return res.status(200).send({
      status: 200,
      data: assignments,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const GetExamsList = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const exams = await firebase
      .firestore()
      .collectionGroup("exams")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then((res) => res.docs.map((doc) => doc.data()));

    if (!exams) {
      res.status(404).send({
        status: 404,
        data: "exams not found",
      });
    }

    return res.status(200).send({
      status: 200,
      data: exams,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const GetClassesList = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const classes = await firebase
      .firestore()
      .collectionGroup("classes")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then((res) => res.docs.map((doc) => doc.data()));

    if (!classes) {
      res.status(404).send({
        status: 404,
        data: "classes not found",
      });
    }

    return res.status(200).send({
      status: 200,
      data: classes,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const CreateAssignment = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;

  if (Data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get staff details
        const staffData = await transaction
          .get(
            firebase
              .firestore()
              .collection("staffs")
              .where("StaffId", "==", StaffId.trim())
          )
          .then((res) => res.docs.map((doc) => doc.data())[0]);

        //get subject details
        const SubId = Data.find((input) => input.id == "subject")
          ["value"]._id.trim()
          .toString();
        const subject = await transaction
          .get(firebase.firestore().collectionGroup("subjects"))
          .then((res) => {
            const data = res.docs.find((doc) => doc.id == SubId).data();
            const id = res.docs.find((doc) => doc.id == SubId).id;
            return { _id: id, ...data };
          });

        //get student id's
        const StudentIds = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then((res) =>
            res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
          );

        //add assignment details to assignment collection
        await transaction.set(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/assignments/`
            )
            .doc(),
          {
            InId: InId.trim().toString(),
            DepId: Data.find((input) => input.id == "department")
              ["value"]._id.toString()
              .trim(),
            SemId: Data.find((input) => input.id == "semester")
              ["value"]._id.toString()
              .toString()
              .trim(),
            StaffId: staffData.StaffId.trim(),
            staffName: staffData.firstName + " " + staffData.lastName,
            project: Data.find((input) => input.id == "project").value.trim(),
            description: Data.find(
              (input) => input.id == "description"
            ).value.trim(),
            subject: subject.subName.trim(),
            staff: staffData,
            subCode: subject.subCode.toString().trim(),
            subjectData: subject,
            students: StudentIds,
            studentsStatus: StudentIds.map((id) => ({
              StudId: id.trim().toString(),
              file: "",
              status: "PENDING",
            })),
            date: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  "12:00:00:AM"
              )
            ),
            dueDate: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "dueDate").value.trim() +
                  " " +
                  "12:00:00:AM"
              )
            ),
          }
        );

        res.status(200).send({
          status: 200,
          message: "Assignment created successfully!",
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const GetExams = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      const data = await transaction
        .get(
          firebase
            .firestore()
            .collection("students")
            .where("InId", "==", InId.trim())
            .where("DepId", "==", DepId.trim())
            .where("SemId", "==", SemId.trim())
        )
        .then(
          async (res) =>
            await Promise.all(
              res.docs.map(async (doc) => {
                const studentData = doc.data();
                const id = doc.id;

                const exams = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collectionGroup("exams")
                      .where("InId", "==", studentData.InId)
                      .where("DepId", "==", studentData.DepId.trim())
                      .where("SemId", "==", studentData.SemId.trim())
                      .where("students", "array-contains-any", [
                        studentData.StudId.trim(),
                      ])
                  )
                  .then(
                    async (res) =>
                      await Promise.all(
                        res.docs.map(async (res) => {
                          const data = res.data();
                          const id = res.id;

                          return {
                            ExamId: id,
                            title: data.title,
                            subject: data.subject,
                            subCode: data.subCode,
                            date: data.date.toDate().toDateString(),
                            staffName: data.staffName,
                            start: data.startingTime
                              .toDate()
                              .toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .toUpperCase(),
                            end: data.endingTime
                              .toDate()
                              .toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .toUpperCase(),
                            status: data.studentsStatus
                              .find(
                                (status) =>
                                  status.StudId === studentData.StudId.trim()
                              )
                              ["status"].toUpperCase(),
                            file: data.studentsStatus.find(
                              (status) =>
                                status.StudId === studentData.StudId.trim()
                            ).file,
                          };
                        })
                      )
                  );

                const examCompleted = [];

                exams.map((obj) =>
                  obj.status == "COMPLETED" ? examCompleted.push(obj) : null
                );

                const examChecking = [];

                exams.map((obj) =>
                  obj.status == "CHECKING" ? examChecking.push(obj) : null
                );

                const examPending = [];

                exams.map((obj) =>
                  obj.status == "PENDING" ? examPending.push(obj) : null
                );

                const examCompletedPercentage =
                  (examCompleted.length / exams.length) * 100;

                const examCheckingPercentage =
                  (examChecking.length / exams.length) * 100;

                const examPendingPercentage =
                  (examPending.length / exams.length) * 100;

                const subjects = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collection(
                        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
                      )
                  )
                  .then((res) =>
                    res.docs.map((doc) => ({ _id: doc.id, ...doc.data() }))
                  );

                return {
                  examsData: {
                    examCompletedPercentage,
                    examCheckingPercentage,
                    examPendingPercentage,
                    subjectList: subjects.map((subject) => ({
                      SubId: subject._id,
                      subCode: subject.subCode,
                      subName: subject.subName,
                      crAt: subject.crAt,
                      crBy: subject.crBy,
                    })),
                    subjects: subjects.map((subject) => {
                      const totalExams = [];
                      exams.map((obj) =>
                        obj.subCode == subject.subCode
                          ? totalExams.push(obj)
                          : null
                      );
                      const examCompleted = [];
                      exams.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "COMPLETED"
                            ? examCompleted.push(obj)
                            : null
                          : null
                      );
                      const examChecking = [];
                      exams.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "CHECKING"
                            ? examChecking.push(obj)
                            : null
                          : null
                      );
                      const examPending = [];
                      exams.map((obj) =>
                        obj.subCode == subject.subCode
                          ? obj.status === "PENDING"
                            ? examPending.push(obj)
                            : null
                          : null
                      );

                      const examCompletedPercentage =
                        (examCompleted.length / totalExams.length) * 100;

                      const examCheckingPercentage =
                        (examChecking.length / totalExams.length) * 100;

                      const examPendingPercentage =
                        (examPending.length / totalExams.length) * 100;

                      return {
                        subject: subject.subName.toUpperCase(),
                        Completed: examCompleted.length,
                        Checking: examChecking.length,
                        Pending: examPending.length,
                      };
                    }),
                    exams,
                  },
                  id,
                  ...studentData,
                };
              })
            )
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
          InId: obj.InId.trim(),
          DepId: obj.DepId.trim(),
          SemId: obj.SemId.trim(),
          StudId: obj.StudId.trim(),
          firstName: obj.firstName.trim(),
          lastName: obj.lastName.trim(),
          email: obj.email.trim(),
          examsData: obj.examsData,
          gender: obj.gender.trim(),
          profile: obj.profile.trim(),
          bloodGroup: obj.bloodGroup.trim(),
          religion: obj.religion.trim(),
          title: obj.title.trim(),
          country: obj.country.trim(),
          state: obj.state.trim(),
          district: obj.district.trim(),
          contMob: obj.contMob.trim(),
          age: obj.age.trim(),
          qualification: obj.qualification.trim(),
          dob: obj.dob.toDate().toLocaleDateString("sv"),
          pincode: obj.pincode.trim(),
          fathName: obj.fathName.trim(),
          fathOccu: obj.fathOccu.trim(),
          fathMob: obj.fathMob.trim(),
          mothName: obj.mothName.trim(),
          mothOccu: obj.mothOccu.trim(),
          mothMob: obj.mothMob.trim(),
          community: obj.community.trim(),
          institution: {
            name: obj.institution.name,
            email: obj.institution.email,
            address1: obj.institution.address1,
            address2: obj.institution.address2,
            address3: obj.institution.address3,
            country: obj.institution.country,
            state: obj.institution.state,
            district: obj.institution.district,
            postalCode: obj.institution.postalCode,
            phone: obj.institution.phone,
          },
          crAt: obj.crAt.toDate().toDateString(),
          modAt: obj.modAt.toDate().toDateString(),
          depName: obj.depName.trim(),
          googleAuth: obj.googleAuth,
          type: obj.type.trim(),
          semName: obj.semName.trim(),
          contactAddress1: obj.contactAddress1.trim(),
          contactAddress2: obj.contactAddress2.trim(),
          contactAddress3: obj.contactAddress3.trim(),
          addmisNo: obj.addmisNo.trim(),
        })),
        items: Object.keys(data).length,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetHolidays = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("holidays")
      .where("InId", "==", InId.toString().trim())
      .where("DepId", "==", DepId.toString().trim())
      .where("SemId", "==", SemId.toString().trim())
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
        event: obj.event.toString().trim(),
        startingDate: obj.startingDate.toDate().toDateString().toUpperCase(),
        endingDate: obj.endingDate.toDate().toDateString().toUpperCase(),
        message: obj.message.toString().trim(),
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const CreateHolidays = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;
  try {
    await firebase
      .firestore()
      .collection(
        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/holidays/`
      )
      .add({
        InId: InId.trim(),
        DepId: DepId.trim(),
        SemId: SemId.trim(),
        StaffId: StaffId.trim(),
        event: Data.find((input) => input.id == "event").value.trim(),
        message: Data.find((input) => input.id == "message").value.trim(),
        startingDate: firebase.firestore.Timestamp.fromMillis(
          new Date(
            Data.find((input) => input.id == "startingDate").value.trim() +
              " " +
              "12:00:00:AM"
          )
        ),
        endingDate: firebase.firestore.Timestamp.fromMillis(
          new Date(
            Data.find((input) => input.id == "endingDate").value.trim() +
              " " +
              "12:00:00:AM"
          )
        ),
      });
    res.status(200).send({
      status: 200,
      message: "Holiday created successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const CreateExam = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;

  if (Data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get staff details
        const staffData = await transaction
          .get(
            firebase
              .firestore()
              .collection("staffs")
              .where("StaffId", "==", StaffId.trim())
          )
          .then((res) => res.docs.map((doc) => doc.data())[0]);

        //get subject details
        const SubId = Data.find((input) => input.id == "subject")
          ["value"]._id.trim()
          .toString();
        const subject = await transaction
          .get(firebase.firestore().collectionGroup("subjects"))
          .then((res) => {
            const data = res.docs.find((doc) => doc.id == SubId).data();
            const id = res.docs.find((doc) => doc.id == SubId).id;
            return { _id: id, ...data };
          });

        //get student id's
        const StudentIds = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then((res) =>
            res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
          );

        //add exam details to exam collection
        await transaction.set(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/exams/`
            )
            .doc(),
          {
            InId: InId.trim().toString(),
            DepId: Data.find((input) => input.id == "department")
              ["value"]._id.toString()
              .trim(),
            SemId: Data.find((input) => input.id == "semester")
              ["value"]._id.toString()
              .toString()
              .trim(),
            StaffId: staffData.StaffId.trim(),
            staffName: staffData.firstName + " " + staffData.lastName,
            title: Data.find((input) => input.id == "title").value.trim(),
            description: Data.find(
              (input) => input.id == "description"
            ).value.trim(),
            examCode: Data.find((input) => input.id == "examCode").value.trim(),
            subject: subject.subName.trim(),
            staff: staffData,
            subCode: subject.subCode.toString().trim(),
            subjectData: subject,
            students: StudentIds,
            studentsStatus: StudentIds.map((id) => ({
              StudId: id.trim().toString(),
              file: "",
              status: "PENDING",
            })),
            date: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  "12:00:00:AM"
              )
            ),
            startingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "startingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
            endingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "endingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
          }
        );

        res.status(200).send({
          status: 200,
          message: "Exam created successfully!",
        });
      });
    } catch (err) {
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const CreateSubject = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;

  if (Data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get student id's
        const StudentIds = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then((res) =>
            res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
          );

        const SubId = firebase
          .firestore()
          .collection(
            `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
          )
          .doc().id;

        //add subject to student's attendane collection

        try {
          StudentIds.map(async (StudId) => {
            console.log(StudId);
            await transaction
              .get(
                firebase
                  .firestore()
                  .collection(
                    `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                  )
                  .doc(StudId.trim())
              )
              .then(async (res) => {
                const data = res.data();
                let subjectList = data.subjectList;
                subjectList.push({
                  SubId: SubId.trim(),
                  crAt: new Date(),
                  crBy: StaffId.trim(),
                  subName: Data.find((input) => input.id == "subName")
                    .value.trim()
                    .toString(),
                  subCode: Data.find((input) => input.id == "subCode")
                    .value.trim()
                    .toString(),
                  classes: {},
                  currentMonthPercentage: 0,
                  overAllPercentage: 0,
                  overAllPeriods: 0,
                  overAllPrecent: 0,
                });

                await transaction.set(
                  firebase
                    .firestore()
                    .collection(
                      `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                    )
                    .doc(StudId.trim()),
                  {
                    subjectList: subjectList,
                  },
                  { merge: true }
                );
              })
              .catch((err) => console.log(err));
          });
        } catch (err) {
          console.log(err);
        }

        //add subject details to subject collection
        transaction.set(
          await firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
            )
            .doc(SubId),
          {
            InId: InId.trim().toString(),
            DepId: Data.find((input) => input.id == "department")
              ["value"]._id.toString()
              .trim(),
            SemId: Data.find((input) => input.id == "semester")
              ["value"]._id.toString()
              .toString()
              .trim(),
            StaffId: StaffId.trim(),
            crAt: firebase.firestore.FieldValue.serverTimestamp(),
            crBy: StaffId.trim(),
            subName: Data.find((input) => input.id == "subName")
              .value.trim()
              .toString(),
            subCode: Data.find((input) => input.id == "subCode")
              .value.trim()
              .toString(),
          }
        );

        res.status(200).send({
          status: 200,
          message: "Subject created successfully!",
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const GetClasses = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      const data = await transaction
        .get(
          firebase
            .firestore()
            .collectionGroup("classes")
            .where("InId", "==", InId.trim())
            .where("DepId", "==", DepId.trim())
            .where("SemId", "==", SemId.trim())
        )
        .then(
          async (res) =>
            await Promise.all(
              res.docs.map(async (doc) => {
                const classdata = doc.data();
                const id = doc.id;
                const studentsData = [];

                await Promise.all(
                  classdata.students.map(async (studId) => {
                    await transaction
                      .get(
                        firebase
                          .firestore()
                          .collection("students")
                          .where("StudId", "==", studId.trim())
                      )
                      .then(
                        async (res) =>
                          await Promise.all(
                            res.docs.map(async (doc) => {
                              const data = doc.data();

                              const attendanceLog = await transaction
                                .get(
                                  firebase
                                    .firestore()
                                    .collectionGroup("attendance")
                                    .where("StudId", "==", data.StudId)
                                )
                                .then(
                                  (res) =>
                                    res.docs.map((doc) => doc.data())[0]
                                      .attendanceLog
                                );

                              return studentsData.push({
                                InId: data.InId.trim(),
                                DepId: data.DepId.trim(),
                                SemId: data.SemId.trim(),
                                StudId: data.StudId.trim(),
                                firstName: data.firstName.trim(),
                                lastName: data.lastName.trim(),
                                email: data.email.trim(),
                                assignmentsData: data.assignmentsData,
                                gender: data.gender.trim(),
                                profile: data.profile.trim(),
                                bloodGroup: data.bloodGroup.trim(),
                                religion: data.religion.trim(),
                                title: data.title.trim(),
                                country: data.country.trim(),
                                attendanceLog: attendanceLog,
                                state: data.state.trim(),
                                district: data.district.trim(),
                                contMob: data.contMob.trim(),
                                age: data.age.trim(),
                                qualification: data.qualification.trim(),
                                dob: data.dob.toDate().toLocaleDateString("sv"),
                                pincode: data.pincode.trim(),
                                fathName: data.fathName.trim(),
                                fathOccu: data.fathOccu.trim(),
                                fathMob: data.fathMob.trim(),
                                mothName: data.mothName.trim(),
                                mothOccu: data.mothOccu.trim(),
                                mothMob: data.mothMob.trim(),
                                community: data.community.trim(),
                                institution: {
                                  name: data.institution.name,
                                  email: data.institution.email,
                                  address1: data.institution.address1,
                                  address2: data.institution.address2,
                                  address3: data.institution.address3,
                                  country: data.institution.country,
                                  state: data.institution.state,
                                  district: data.institution.district,
                                  postalCode: data.institution.postalCode,
                                  phone: data.institution.phone,
                                },
                                crAt: data.crAt.toDate().toDateString(),
                                modAt: data.modAt.toDate().toDateString(),
                                depName: data.depName.trim(),
                                googleAuth: data.googleAuth,
                                type: data.type.trim(),
                                semName: data.semName.trim(),
                                contactAddress1: data.contactAddress1.trim(),
                                contactAddress2: data.contactAddress2.trim(),
                                contactAddress3: data.contactAddress3.trim(),
                                addmisNo: data.addmisNo.trim(),
                              });
                            })
                          )
                      );
                  })
                );

                return { id, studentsData, ...classdata };
              })
            )
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
          InId: obj.InId,
          DepId: obj.DepId,
          SemId: obj.SemId,
          StaffId: obj.StaffId,
          ClsId: obj.id,
          SubId: obj.SubId.toString().trim(),
          date: obj.date.toDate().toDateString(),
          datetoLocaleDateString: obj.date.toDate().toLocaleDateString("sv"),
          startingTime: obj.startingTime
            .toDate()
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toUpperCase(),
          startingTime24: obj.startingTime
            .toDate()
            .toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .toUpperCase(),
          endingTime: obj.endingTime
            .toDate()
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toUpperCase(),

          endingTime24: obj.endingTime.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          meeting: obj.meeting.join_url ? obj.meeting : false,
          status: obj.meeting.join_url ? "STARTED" : "NOT YET STARTED",
          subject: obj.subject.toString().trim(),
          chapter: obj.chapter.toString().trim(),
          staffName: obj.staffName.toString().trim(),
          studentsData: obj.studentsData,
        })),
        items: Object.keys(data).length,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const CreateClass = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;

  if (Data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get staff details
        const staffData = await transaction
          .get(
            firebase
              .firestore()
              .collection("staffs")
              .where("StaffId", "==", StaffId.trim())
          )
          .then((res) => res.docs.map((doc) => doc.data())[0]);

        //get subject details
        const SubId = Data.find((input) => input.id == "subject")
          ["value"]._id.trim()
          .toString();
        const subject = await transaction
          .get(firebase.firestore().collectionGroup("subjects"))
          .then((res) => {
            const data = res.docs.find((doc) => doc.id == SubId).data();
            const id = res.docs.find((doc) => doc.id == SubId).id;
            return { _id: id, ...data };
          });

        //get student id's
        const StudentIds = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then((res) =>
            res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
          );

        //add class details to students attendance collections

        const ClsId = await firebase
          .firestore()
          .collection(
            `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/classes/`
          )
          .doc().id;

        await Promise.all(
          StudentIds.map(async (StudId) => {
            await transaction
              .get(
                firebase
                  .firestore()
                  .collectionGroup("attendance")
                  .where("InId", "==", InId.trim())
                  .where("DepId", "==", DepId.trim())
                  .where("SemId", "==", SemId.trim())
                  .where("StudId", "==", StudId.trim())
              )
              .then((data) => {
                data.docs.map(async (doc) => {
                  const data = doc.data();
                  const subjectList = data.subjectList;
                  const attendanceLog = data.attendanceLog;

                  attendanceLog.push({
                    ClsId: ClsId,
                    StaffId: staffData.StaffId.trim(),
                    SubId: subject._id.trim(),
                    date: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          "12:00:00:AM"
                      )
                    ),
                    staffName:
                      staffData.firstName.trim() +
                      " " +
                      staffData.lastName.trim(),
                    subName: subject.subName.trim(),
                    staffData: staffData,
                    subjectData: subject,
                    status: "ABSENT",
                    startingTime: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          new Date(
                            "1970-01-01T" +
                              Data.find(
                                (input) => input.id == "startingTime"
                              ).value.trim() +
                              "Z"
                          ).toLocaleTimeString(
                            {},
                            {
                              timeZone: "UTC",
                              hour12: true,
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                      )
                    ),
                    endingTime: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          new Date(
                            "1970-01-01T" +
                              Data.find(
                                (input) => input.id == "endingTime"
                              ).value.trim() +
                              "Z"
                          ).toLocaleTimeString(
                            {},
                            {
                              timeZone: "UTC",
                              hour12: true,
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                      )
                    ),
                  });

                  const subjectToupdate =
                    subjectList[
                      subjectList.findIndex(
                        (subject) => subject.SubId === SubId.trim()
                      )
                    ];

                  subjectToupdate.classes = {
                    ...subjectToupdate.classes,
                    [ClsId]: {
                      ...subjectToupdate.classes[ClsId],
                      ClsId: ClsId,
                      status: "ABSENT",
                    },
                  };

                  subjectToupdate.overAllPeriods =
                    subjectToupdate.overAllPeriods + 1;

                  // reassign object to local array variable
                  subjectList[
                    subjectList.findIndex(
                      (subject) => subject.SubId === SubId.trim()
                    )
                  ] = subjectToupdate;

                  await transaction.set(
                    firebase
                      .firestore()
                      .collection(
                        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                      )
                      .doc(StudId.trim()),
                    {
                      overAllPeriods:
                        firebase.firestore.FieldValue.increment(+1),
                      subjectList: subjectList,
                      attendanceLog: attendanceLog,
                    },
                    { merge: true }
                  );
                });
              });
          })
        );

        //add class details to class collection
        await transaction.set(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/classes/`
            )
            .doc(ClsId),
          {
            InId: InId.trim().toString(),
            DepId: Data.find((input) => input.id == "department")
              ["value"]._id.toString()
              .trim(),
            SemId: Data.find((input) => input.id == "semester")
              ["value"]._id.toString()
              .toString()
              .trim(),
            SubId: subject._id.trim(),
            StaffId: staffData.StaffId.trim(),
            staffName: staffData.firstName + " " + staffData.lastName,
            subject: subject.subName.trim(),
            chapter: Data.find((input) => input.id == "chapter").value.trim(),
            meeting: {
              id: "",
              join_url:
                Data.find((input) => input.id == "meetingUrl").value.trim() ==
                ""
                  ? null
                  : Data.find((input) => input.id == "meetingUrl").value.trim(),
              vendor: "",
            },
            staffData: staffData,
            subCode: subject.subCode.toString().trim(),
            subjectData: subject,
            students: StudentIds,
            date: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  "12:00:00:AM"
              )
            ),
            startingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "startingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
            endingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "endingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
          }
        );

        res.status(200).send({
          status: 200,
          message: "Class created successfully!",
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const AddStudentAttendance = async (req, res) => {
  const { InId, DepId, SemId, StudId, SubId, ClsId, Status } = req.body;
  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      await transaction
        .get(
          firebase
            .firestore()
            .collectionGroup("attendance")
            .where("InId", "==", InId.trim())
            .where("DepId", "==", DepId.trim())
            .where("SemId", "==", SemId.trim())
            .where("StudId", "==", StudId.trim())
        )
        .then((data) => {
          data.docs.map(async (doc) => {
            const data = doc.data();
            const subjectList = data.subjectList;
            const attendanceLog = data.attendanceLog;

            let attendanceLogToUpdate =
              attendanceLog[
                attendanceLog.findIndex((log) => log.ClsId == ClsId.trim())
              ];

            attendanceLogToUpdate.status = Status.toUpperCase();

            attendanceLog[
              attendanceLog.findIndex((log) => log.ClsId == ClsId.trim())
            ] = attendanceLogToUpdate;

            const subjectToupdate =
              subjectList[
                subjectList.findIndex(
                  (subject) => subject.SubId === SubId.trim()
                )
              ];

            subjectToupdate.overAllPrecent =
              Status.toUpperCase().trim() == "PRECENT"
                ? subjectToupdate.overAllPrecent + 1
                : Status.toUpperCase().trim() == "ABSENT"
                ? subjectToupdate.overAllPrecent - 1
                : subjectToupdate.overAllPrecent;

            subjectToupdate.classes = {
              ...subjectToupdate.classes,
              [ClsId.trim()]: {
                ...subjectToupdate.classes[ClsId.trim()],
                status: Status.toUpperCase(),
              },
            };

            subjectList[
              subjectList.findIndex((subject) => subject.SubId === SubId.trim())
            ] = subjectToupdate;

            await transaction.set(
              firebase
                .firestore()
                .collection(
                  `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                )
                .doc(StudId.trim()),
              {
                overAllPrecent:
                  Status.toUpperCase().trim() == "PRECENT"
                    ? firebase.firestore.FieldValue.increment(+1)
                    : Status.toUpperCase().trim() == "ABSENT"
                    ? firebase.firestore.FieldValue.increment(-1)
                    : firebase.firestore.FieldValue,
                subjectList: subjectList,
                attendanceLog: attendanceLog,
              },
              { merge: true }
            );
          });
        })
        .then((response) => res.send({ status: 200, data: response }))
        .catch((err) => res.send({ status: 200, error: err }));
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const UpdateAssignmentStatus = async (req, res) => {
  const { InId, DepId, SemId, StudId, AssgId, Status } = req.body;
  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      await transaction
        .get(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/assignments/`
            )
            .doc(AssgId.trim())
        )
        .then(async (res) => {
          const data = res.data();
          let studentsStatus = data.studentsStatus;
          let studentStatusToUpdate = studentsStatus.find(
            (status) => status.StudId == StudId.trim()
          );
          studentStatusToUpdate.status = Status.trim().toUpperCase().toString();

          studentsStatus[
            studentsStatus.find((status) => status.StudId == StudId.trim())
          ] = studentStatusToUpdate;

          await transaction.set(
            firebase
              .firestore()
              .collection(
                `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/assignments/`
              )
              .doc(AssgId.trim()),
            {
              studentsStatus: studentsStatus,
            },
            { merge: true }
          );
        });

      res.status(200).send({
        status: 200,
        message: "Assignment Status Updated Successfully!",
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const UpdateExamStatus = async (req, res) => {
  const { InId, DepId, SemId, StudId, ExamId, Status } = req.body;
  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      await transaction
        .get(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/exams/`
            )
            .doc(ExamId.trim())
        )
        .then(async (res) => {
          const data = res.data();
          let studentsStatus = data.studentsStatus;
          let studentStatusToUpdate = studentsStatus.find(
            (status) => status.StudId == StudId.trim()
          );
          studentStatusToUpdate.status = Status.trim().toUpperCase().toString();

          studentsStatus[
            studentsStatus.find((status) => status.StudId == StudId.trim())
          ] = studentStatusToUpdate;

          await transaction.set(
            firebase
              .firestore()
              .collection(
                `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/exams/`
              )
              .doc(ExamId.trim()),
            {
              studentsStatus: studentsStatus,
            },
            { merge: true }
          );
        });

      res.status(200).send({
        status: 200,
        message: "Exams Status Updated Successfully!",
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const UpdateClass = async (req, res) => {
  const { InId, DepId, SemId, ClsId, Data } = req.body;

  if (Data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get student id's
        const StudentIds = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
          )
          .then((res) =>
            res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
          );

        //update class details to students attendance collections

        await Promise.all(
          StudentIds.map(async (StudId) => {
            await transaction
              .get(
                firebase
                  .firestore()
                  .collectionGroup("attendance")
                  .where("InId", "==", InId.trim())
                  .where("DepId", "==", DepId.trim())
                  .where("SemId", "==", SemId.trim())
                  .where("StudId", "==", StudId.trim())
              )
              .then((data) => {
                data.docs.map(async (doc) => {
                  const data = doc.data();
                  const subjectList = data.subjectList;
                  const attendanceLog = data.attendanceLog;

                  let attendanceLogToUpdate =
                    attendanceLog[
                      attendanceLog.findIndex(
                        (log) => log.ClsId == ClsId.trim()
                      )
                    ];

                  attendanceLogToUpdate = {
                    ...attendanceLogToUpdate,
                    date: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          "12:00:00:AM"
                      )
                    ),
                    startingTime: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          new Date(
                            "1970-01-01T" +
                              Data.find(
                                (input) => input.id == "startingTime"
                              ).value.trim() +
                              "Z"
                          ).toLocaleTimeString(
                            {},
                            {
                              timeZone: "UTC",
                              hour12: true,
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                      )
                    ),
                    endingTime: firebase.firestore.Timestamp.fromMillis(
                      new Date(
                        Data.find((input) => input.id == "date").value.trim() +
                          " " +
                          new Date(
                            "1970-01-01T" +
                              Data.find(
                                (input) => input.id == "endingTime"
                              ).value.trim() +
                              "Z"
                          ).toLocaleTimeString(
                            {},
                            {
                              timeZone: "UTC",
                              hour12: true,
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                      )
                    ),
                  };

                  attendanceLog[
                    attendanceLog.findIndex((log) => log.ClsId == ClsId.trim())
                  ] = attendanceLogToUpdate;

                  await transaction.set(
                    firebase
                      .firestore()
                      .collection(
                        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                      )
                      .doc(StudId.trim()),
                    {
                      attendanceLog: attendanceLog,
                    },
                    { merge: true }
                  );
                });
              });
          })
        );

        //update class details to class collection
        await transaction.set(
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/classes/`
            )
            .doc(ClsId.trim()),
          {
            chapter: Data.find((input) => input.id == "chapter").value.trim(),
            meeting: {
              id: "",
              join_url:
                Data.find((input) => input.id == "meetingUrl").value.trim() ==
                ""
                  ? null
                  : Data.find((input) => input.id == "meetingUrl").value.trim(),
              vendor: "",
            },
            students: StudentIds,
            date: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  "12:00:00:AM"
              )
            ),
            startingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "startingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
            endingTime: firebase.firestore.Timestamp.fromMillis(
              new Date(
                Data.find((input) => input.id == "date").value.trim() +
                  " " +
                  new Date(
                    "1970-01-01T" +
                      Data.find(
                        (input) => input.id == "endingTime"
                      ).value.trim() +
                      "Z"
                  ).toLocaleTimeString(
                    {},
                    {
                      timeZone: "UTC",
                      hour12: true,
                      hour: "numeric",
                      minute: "numeric",
                    }
                  )
              )
            ),
          },
          { merge: true }
        );

        res.status(200).send({
          status: 200,
          message: "Class Updated successfully!",
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const UploadProfile = async (req, res) => {
  const { name, StudId, InId } = req.body;
  try {
    if (name && StudId && InId) {
      await firebase.firestore().runTransaction(async (transaction) => {
        const file = req.files.file;
        if (req.files === null) {
          return res
            .status(400)
            .send({ status: 400, error: "No file uploaded!" });
        }
        const fileName = name.split(/\s/).join("");

        const student = await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("StudId", "==", StudId.trim())
          )
          .then((res) => res.docs.map((doc) => doc.data())[0]);

        const email = student.email;
        const location = `./Assets/studentProfiles/IN${InId}-STUD${email}-${fileName}`;

        await transaction.set(
          firebase.firestore().collection("students").doc(email.trim()),
          {
            profile: `IN${InId}-STUD${email}-${fileName}`,
          },
          { merge: true }
        );

        file.mv(location, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send(err);
          }
        });

        return res.send({
          status: 200,
          message: "success",
        });
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const UpdateStudent = async (req, res) => {
  const { InId, DepId, SemId, StudId, Data } = req.body;

  try {
    if (InId && DepId && SemId && StudId) {
      await firebase.firestore().runTransaction(async (transaction) => {
        await transaction
          .get(
            firebase
              .firestore()
              .collection("students")
              .where("InId", "==", InId.trim())
              .where("DepId", "==", DepId.trim())
              .where("SemId", "==", SemId.trim())
              .where("StudId", "==", StudId.trim())
          )
          .then(async (result) => {
            const email = result.docs
              .map((doc) => doc.data().email)
              .filter((c) => c != undefined)
              .toString()
              .trim();
            await transaction.set(
              firebase.firestore().collection("/students").doc(email.trim()),
              {
                firstName: Data.map((input) =>
                  input.id == "firstName" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                lastName: Data.map((input) =>
                  input.id == "lastName" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                gender: Data.map((input) =>
                  input.id == "gender" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                bloodGroup: Data.map((input) =>
                  input.id == "bloodGroup" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                country: Data.map((input) =>
                  input.id == "country" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                state: Data.map((input) =>
                  input.id == "state" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                district: Data.map((input) =>
                  input.id == "district" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                contMob: Data.map((input) =>
                  input.id == "contMob" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                age: Data.map((input) =>
                  input.id == "age" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                qualification: Data.map((input) =>
                  input.id == "qualification" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                dob: (date = Data.map((obj) =>
                  obj.id === "dob"
                    ? firebase.firestore.Timestamp.fromMillis(
                        new Date(obj.value + " " + "12:00:00:AM")
                      )
                    : null
                ).filter((c) => c != null))[0],
                pincode: Data.map((input) =>
                  input.id == "pincode" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                fathName: Data.map((input) =>
                  input.id == "fathName" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                fathOccu: Data.map((input) =>
                  input.id == "fathOccu" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                fathMob: Data.map((input) =>
                  input.id == "fathMob" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                mothName: Data.map((input) =>
                  input.id == "mothName" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                mothOccu: Data.map((input) =>
                  input.id == "mothOccu" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                mothMob: Data.map((input) =>
                  input.id == "mothMob" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
                modAt: firebase.firestore.FieldValue.serverTimestamp(),
                addmisNo: Data.map((input) =>
                  input.id == "addmisNo" ? input.value : null
                )
                  .filter((c) => c != null)
                  .toString(),
              },
              { merge: true }
            );
          })
          .catch((err) => console.log(err));

        return res.send({
          status: 200,
          message: "success",
        });
      });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const CreateStudent = async (req, res) => {
  const data = JSON.parse(req.body.data);
  const InId = req.body.InId;
  if (data.length) {
    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        //get institution details
        const institution = await transaction
          .get(firebase.firestore().collection("institutions").doc(InId.trim()))
          .then((res) => {
            const data = res.data();
            const id = res.id;
            return { _id: id, ...data };
          });

        //upload profile picture
        const profile = req.files.profile;
        const name = profile.name;
        if (req.files === null) {
          return res
            .status(400)
            .send({ status: 400, error: "No file uploaded!" });
        }
        const fileName = name.split(/\s/).join("");

        const location = `./Assets/studentProfiles/IN${InId}-STUD${data
          .map((input) => (input.id == "email" ? input.value : null))
          .filter((c) => c != null)
          .toString()
          .trim()}-${fileName}`;
        profile.mv(location, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send(err);
          }
        });

        //add student details to students collection
        await transaction.set(
          firebase
            .firestore()
            .collection("students")
            .doc(
              data
                .map((input) => (input.id == "email" ? input.value : null))
                .filter((c) => c != null)
                .toString()
                .trim()
            ),
          {
            InId: InId.trim().toString(),
            DepId: data
              .map((input) =>
                input.id == "department" ? input.value._id : null
              )
              .filter((c) => c != null)
              .toString()
              .trim(),
            SemId: data
              .map((input) => (input.id == "semester" ? input.value._id : null))
              .filter((c) => c != null)
              .toString()
              .trim(),
            StudId: "",
            firstName: data
              .map((input) => (input.id == "firstName" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            lastName: data
              .map((input) => (input.id == "lastName" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            email: data
              .map((input) => (input.id == "email" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            gender: data
              .map((input) => (input.id == "gender" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            profile: `IN${InId}-STUD${data
              .map((input) => (input.id == "email" ? input.value : null))
              .filter((c) => c != null)
              .toString()
              .trim()}-${fileName}`,
            bloodGroup: data
              .map((input) => (input.id == "bloodGroup" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            religion: data
              .map((input) => (input.id == "religion" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            title: data
              .map((input) => (input.id == "title" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            country: data
              .map((input) => (input.id == "country" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            state: data
              .map((input) => (input.id == "state" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            district: data
              .map((input) => (input.id == "district" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            contMob: data
              .map((input) => (input.id == "contMob" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            age: data
              .map((input) => (input.id == "age" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            qualification: data
              .map((input) =>
                input.id == "qualification" ? input.value : null
              )
              .filter((c) => c != null)
              .toString(),
            dob: (date = data
              .map((obj) =>
                obj.id === "dob"
                  ? firebase.firestore.Timestamp.fromMillis(
                      new Date(obj.value + " " + "12:00:00:AM")
                    )
                  : null
              )
              .filter((c) => c != null))[0],
            pincode: data
              .map((input) => (input.id == "pincode" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            fathName: data
              .map((input) => (input.id == "fathName" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            fathOccu: data
              .map((input) => (input.id == "fathOccu" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            fathMob: data
              .map((input) => (input.id == "fathMob" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            mothName: data
              .map((input) => (input.id == "mothName" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            mothOccu: data
              .map((input) => (input.id == "mothOccu" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            mothMob: data
              .map((input) => (input.id == "mothMob" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            community: data
              .map((input) => (input.id == "community" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
            institution: {
              name: institution.name,
              email: institution.email,
              address1: institution.address1,
              address2: institution.address2,
              address3: institution.address3,
              country: institution.country,
              state: institution.state,
              district: institution.district,
              postalCode: institution.postalCode,
              phone: institution.phone,
            },
            crAt: firebase.firestore.FieldValue.serverTimestamp(),
            modAt: firebase.firestore.FieldValue.serverTimestamp(),
            depName: data
              .map((input) =>
                input.id == "department" ? input.value.name : null
              )
              .filter((c) => c != null)
              .toString()
              .trim(),
            googleAuth: false,
            type: "student",
            semName: data
              .map((input) =>
                input.id == "semester" ? input.value.name : null
              )
              .filter((c) => c != null)
              .toString()
              .trim(),
            contactAddress1: data
              .map((input) =>
                input.id == "contactAddress1" ? input.value : null
              )
              .filter((c) => c != null)
              .toString(),
            contactAddress2: data
              .map((input) =>
                input.id == "contactAddress2" ? input.value : null
              )
              .filter((c) => c != null)
              .toString(),
            contactAddress3: data
              .map((input) =>
                input.id == "contactAddress3" ? input.value : null
              )
              .filter((c) => c != null)
              .toString(),
            addmisNo: data
              .map((input) => (input.id == "addmisNo" ? input.value : null))
              .filter((c) => c != null)
              .toString(),
          }
        );

        res.status(200).send({
          status: 200,
          message: "Student created successfully!",
        });
      });
    } catch (err) {
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const AddFeedBack = (req, res) => {
  const { InId, StaffId, Message, Email, Name } = req.body;
  try {
    firebase
      .firestore()
      .collection("feedback")
      .add({
        InId: InId.trim(),
        CratedAt: firebase.firestore.FieldValue.serverTimestamp(),
        UserId: StaffId.trim(),
        type: "STAFF",
        Message: Message.trim(),
        Email: Email.trim(),
        Name: Name.trim(),
      })
      .then((response) =>
        res.status(200).send({
          status: 200,
          data: "feedback ID:" + " " + response.id,
        })
      )
      .catch((err) =>
        res.status(500).send({
          status: 500,
          err: err,
        })
      );
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetRecentStudentsLogins = async (req, res) => {
  const { InId } = req.body;
  try {
    const students = await firebase
      .firestore()
      .collection("students")
      .where("InId", "==", InId.trim())
      .orderBy("lastLogin", "desc")
      .limit(10)
      .get()
      .then((res) => res.docs.map((doc) => doc.data()));

    const timeDeff = (start, end) => {
      var diff = (start - end) / 1000;
      diff /= 60;
      return Math.abs(Math.round(diff));
    };

    res.status(200).send({
      status: 200,
      data: students.map((obj) => ({
        ...obj,
        lastLogin:
          timeDeff(obj.lastLogin.toDate(), new Date()) >= 60
            ? obj.lastLogin.toDate().toLocaleString([], {
                dateStyle: "short",
                timeStyle: "medium",
                hour12: true,
              })
            : timeDeff(obj.lastLogin.toDate(), new Date()) +
              " " +
              "min" +
              " " +
              "ago",
      })),
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudentProfile = (req, res) => {
  res.download(`./Assets/studentProfiles/${req.params.path}`);
};

const GetStudentAssignment = (req, res) => {
  res.download(`./Assets/assignments/${req.params.path}`);
};

const GetExam = (req, res) => {
  res.download(`./Assets/exams/${req.params.path}`);
};

module.exports = {
  checkStaff,
  loginAccount,
  googleLogin,
  createAccount,
  Verify,
  GetSubjects,
  GetStudents,
  GetStudentsAttendance,
  CreateAssignment,
  GetStudentAssignment,
  CreateStudent,
  UpdateStudent,
  GetStudentsAssignments,
  GetClassesList,
  GetExams,
  GetExamsList,
  GetAssignmentsList,
  GetExam,
  GetHolidays,
  CreateHolidays,
  CreateExam,
  AddFeedBack,
  CreateSubject,
  GetClasses,
  AddStudentAttendance,
  CreateClass,
  UpdateAssignmentStatus,
  GetStudentsList,
  GetRecentStudentsLogins,
  UpdateExamStatus,
  UpdateClass,
  UploadProfile,
  GetStudentProfile,
};
