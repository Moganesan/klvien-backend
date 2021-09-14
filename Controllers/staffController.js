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
                gender: data.sex.toUpperCase(),
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
          gender: data.sex.toUpperCase(),
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

    const data = await firebase
      .firestore()
      .collection("staffs")
      .doc(email.trim())
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
          gender: data.sex.toUpperCase(),
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
    const data = await firebase
      .firestore()
      .collection("students")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then(
        async (res) =>
          await Promise.all(
            res.docs.map(async (doc) => {
              const data = doc.data();
              const id = doc.id;

              const attendacne = await firebase
                .firestore()
                .collectionGroup("attendance")
                .where("InId", "==", data.InId)
                .where("DepId", "==", data.DepId.trim())
                .where("SemId", "==", data.SemId.trim())
                .where("StudId", "==", data.StudId.trim())
                .get()
                .then(
                  async (res) =>
                    await Promise.all(
                      res.docs.map(async (res) => {
                        const data = res.data();
                        return {
                          ...data,
                          overAllPercentage: parseInt(
                            (data.overAllPrecent / data.overAllPeriods) * 100
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
                              start: log.start
                                .toDate()
                                .toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                .toUpperCase(),
                              end: log.end
                                .toDate()
                                .toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                .toUpperCase(),
                              duration: timeDeff(
                                log.start.toDate(),
                                log.end.toDate()
                              ),
                              staffName: log.staffName,
                              status: log.status.toUpperCase().trim(),
                            };
                          }),
                        };
                      })
                    )
                );

              return { attendance: attendacne, id, ...data };
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
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetStudentsAssignments = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collection("students")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then(
        async (res) =>
          await Promise.all(
            res.docs.map(async (doc) => {
              const studentData = doc.data();
              const id = doc.id;

              const assignments = await firebase
                .firestore()
                .collectionGroup("assignments")
                .where("InId", "==", studentData.InId)
                .where("DepId", "==", studentData.DepId.trim())
                .where("SemId", "==", studentData.SemId.trim())
                .where("students", "array-contains-any", [
                  studentData.StudId.trim(),
                ])
                .get()
                .then(
                  async (res) =>
                    await Promise.all(
                      res.docs.map(async (res) => {
                        const data = res.data();
                        return {
                          subject: data.subject,
                          subCode: data.subCode,
                          project: data.project,
                          start: data.startingDate.toDate().toDateString(),
                          end: data.endingDate.toDate().toDateString(),
                          staffName: data.staffName,
                          status: data.studentsStatus
                            .find(
                              (status) =>
                                status.StudId === studentData.StudId.trim()
                            )
                            ["status"].toUpperCase(),
                        };
                      })
                    )
                );

              const assignmentCompleted = [];

              assignments.find((obj) =>
                obj.status.toUpperCase() === "COMPLETED"
                  ? assignmentCompleted.push(obj)
                  : null
              );

              const assignmentChecking = [];

              assignments.find((obj) =>
                obj.status.toUpperCase() === "CHECKING"
                  ? assignmentChecking.push(obj)
                  : null
              );

              const assignmentPending = [];

              assignments.find((obj) =>
                obj.status.toUpperCase() === "PENDING"
                  ? assignmentPending.push(obj)
                  : null
              );

              const assignmentCompletedPercentage =
                (assignmentCompleted.length / assignments.length) * 100;

              const assignmentCheckingPercentage =
                (assignmentChecking.length / assignments.length) * 100;

              const assignmentPendingPercentage =
                (assignmentPending.length / assignments.length) * 100;

              const subjects = await firebase
                .firestore()
                .collection(
                  `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/subjects/`
                )
                .get()
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

const CreateAssignment = async (req, res) => {
  const { InId, DepId, SemId, StaffId, Data } = req.body;

  if (Data.length) {
    try {
      //get staff details
      const staffData = await firebase
        .firestore()
        .collection("staffs")
        .where("StaffId", "==", StaffId.trim())
        .get()
        .then((res) => res.docs.map((doc) => doc.data())[0]);

      //get subject details
      const SubId = Data.find((input) => input.id == "subject")
        ["value"]._id.trim()
        .toString();
      const subject = await firebase
        .firestore()
        .collectionGroup("subjects")
        .get()
        .then((res) => {
          const data = res.docs.find((doc) => doc.id == SubId).data();
          const id = res.docs.find((doc) => doc.id == SubId).id;
          return { _id: id, ...data };
        });

      //get student id's
      const StudentIds = await firebase
        .firestore()
        .collection("students")
        .where("InId", "==", InId.trim())
        .where("DepId", "==", DepId.trim())
        .where("SemId", "==", SemId.trim())
        .get()
        .then((res) =>
          res.docs.map((doc) => doc.data().StudId).filter((id) => id != "")
        );

      //add assignment details to assignment collection
      await firebase
        .firestore()
        .collection(
          `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/assignments/`
        )
        .add({
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
            file: null,
            status: "PENDING",
          })),
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
        message: "Assignment created successfully!",
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
    const data = await firebase
      .firestore()
      .collectionGroup("exams")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then(
        async (res) =>
          await Promise.all(
            res.docs.map(async (doc) => {
              const examdata = doc.data();
              const id = doc.id;
              const studentsData = [];
              await Promise.all(
                Object.keys(examdata.studentsStatus).map(async (key, index) => {
                  await firebase
                    .firestore()
                    .collection("students")
                    .where("StudId", "==", key.trim())
                    .get()
                    .then((res) =>
                      res.docs.map((doc) => {
                        const data = doc.data();
                        return studentsData.push({
                          name: data.Name,
                          lname: data.last_name,
                          profile: data.profile,
                          district: data.district,
                          addmisNo: data.admission_number,
                          InId: data.inId,
                          DepId: data.DepId,
                          depName: data.dep_name,
                          SemId: data.SemId,
                          email: data.Email,
                          sex: data.sex.toUpperCase(),
                          bloodGroup: data.blood_group,
                          contAdd1: data.contact_address1,
                          contAdd2: data.contact_address2,
                          contAdd3: data.contact_address3,
                          contMob: data.contact_mobile,
                          fathName: data.father_name,
                          fathOccu: data.father_occupation,
                          fathMob: data.father_mobile,
                          mothName: data.mother_name,
                          mothOccu: data.mother_occupation,
                          mothMob: data.mother_mobile,
                          age: data.age,
                          qualification: data.qualification,
                          title: data.title,
                          StudId: data.StudId,
                          googleAuth: data.googleAuth,
                          dob: data.dob.toDate().toDateString(),
                          community: data.community,
                          city: data.city,
                          examStatus: {
                            status: examdata.studentsStatus[data.StudId].status,
                            file: examdata.studentsStatus[data.StudId].file,
                          },
                        });
                      })
                    );
                })
              );

              return { id, studentsDetails: studentsData, ...examdata };
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
        subject: obj.subject.toString().trim(),
        subjectCode: obj.subject_code.toString().trim(),
        examCode: obj.exam_code.toString().trim(),
        date: obj.date.toDate().toDateString(),
        startingTime: obj.starting_time
          .toDate()
          .toLocaleTimeString()
          .toUpperCase(),
        endingTime: obj.ending_time.toDate().toLocaleTimeString().toUpperCase(),
        description: obj.description.toString().trim(),
        students: obj.studentsDetails,
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetClasses = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("classes")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then(
        async (res) =>
          await Promise.all(
            res.docs.map(async (doc) => {
              const classdata = doc.data();
              const id = doc.id;
              const studentsData = [];

              // await Promise.all(
              //   classdata.students.map(async (studId) => {
              //     await firebase
              //       .firestore()
              //       .collection("students")
              //       .where("StudId", "==", studId.trim())
              //       .get()
              //       .then((res) =>
              //         res.docs.map((doc) => {
              //           const data = doc.data();
              //           return studentsData.push({
              //             name: data.Name,
              //             lname: data.last_name,
              //             profile: data.profile,
              //             district: data.district,
              //             addmisNo: data.admission_number,
              //             InId: data.inId,
              //             DepId: data.DepId,
              //             depName: data.dep_name,
              //             SemId: data.SemId,
              //             email: data.Email,
              //             sex: data.sex.toUpperCase(),
              //             bloodGroup: data.blood_group,
              //             contAdd1: data.contact_address1,
              //             contAdd2: data.contact_address2,
              //             contAdd3: data.contact_address3,
              //             contMob: data.contact_mobile,
              //             fathName: data.father_name,
              //             fathOccu: data.father_occupation,
              //             fathMob: data.father_mobile,
              //             mothName: data.mother_name,
              //             mothOccu: data.mother_occupation,
              //             mothMob: data.mother_mobile,
              //             age: data.age,
              //             qualification: data.qualification,
              //             title: data.title,
              //             StudId: data.StudId,
              //             googleAuth: data.googleAuth,
              //             dob: data.dob.toDate().toDateString(),
              //             community: data.community,
              //             city: data.city,
              //           });
              //         })
              //       );
              //   })
              // );

              return { id, ...classdata };
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
        date: obj.date.toDate().toDateString().toUpperCase(),
        startingTime: obj.start
          .toDate()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toUpperCase(),
        endingTime: obj.end
          .toDate()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toUpperCase(),
        meeting: obj.meeting.join_url ? obj.meeting : false,
        subject: obj.SubName.toString().trim(),
        subId: obj.SubId.toString().trim(),
        chapter: obj.ChapterName.toString().trim(),
        staffName: obj.StaffName.toString().trim(),
        student: obj.studentsDetails,
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const UploadProfile = async (req, res) => {
  const { name, StudId, InId } = req.body;

  try {
    if (name && StudId && InId) {
      const file = req.files.file;
      if (req.files === null) {
        return res
          .status(400)
          .send({ status: 400, error: "No file uploaded!" });
      }
      const fileName = name.split(/\s/).join("");

      await firebase
        .firestore()
        .collection("students")
        .where("StudId", "==", StudId.trim())
        .get()
        .then((docs) => {
          docs.docs.map(async (doc) => {
            const data = doc.data();
            const email = data.email;
            const location = `./Assets/studentProfiles/IN${InId}-STUD${email}-${fileName}`;
            file.mv(location, async (err) => {
              if (err) {
                console.log(err);
                return res.status(500).send(err);
              }
              await firebase
                .firestore()
                .collection("/students")
                .doc(email.trim())
                .set(
                  {
                    profile: `IN${InId}-STUD${email}-${fileName}`,
                  },
                  { merge: true }
                );
            });

            return res.send({
              status: 200,
              message: "success",
            });
          });
        });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const UpdateStudent = async (req, res) => {
  const { InId, DepId, SemId, StudId, Data } = req.body;

  try {
    if (InId && DepId && SemId && StudId) {
      await firebase
        .firestore()
        .collection("students")
        .where("InId", "==", InId.trim())
        .where("DepId", "==", DepId.trim())
        .where("SemId", "==", SemId.trim())
        .where("StudId", "==", StudId.trim())
        .get()
        .then((result) => {
          const email = result.docs
            .map((doc) => doc.data().email)
            .filter((c) => c != undefined)
            .toString()
            .trim();
          firebase
            .firestore()
            .collection("/students")
            .doc(email.trim())
            .set(
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
            )
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));

      return res.send({
        status: 200,
        message: "success",
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
      //get institution details
      const institution = await firebase
        .firestore()
        .collection("institutions")
        .doc(InId.trim())
        .get()
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
      await firebase
        .firestore()
        .collection("students")
        .doc(
          data
            .map((input) => (input.id == "email" ? input.value : null))
            .filter((c) => c != null)
            .toString()
            .trim()
        )
        .set({
          InId: InId.trim().toString(),
          DepId: data
            .map((input) => (input.id == "department" ? input.value._id : null))
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
            .map((input) => (input.id == "qualification" ? input.value : null))
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
            .map((input) => (input.id == "semester" ? input.value.name : null))
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
        });

      res.status(200).send({
        status: 200,
        message: "Student created successfully!",
      });
    } catch (err) {
      return res.status(400).send({ status: 400, error: err });
    }
  }
};

const GetStudentProfile = (req, res) => {
  res.download(`./Assets/studentProfiles/${req.params.path}`);
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
  CreateStudent,
  UpdateStudent,
  GetStudentsAssignments,
  GetExams,
  GetClasses,
  UploadProfile,
  GetStudentProfile,
};
