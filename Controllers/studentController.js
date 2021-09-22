const firebase = require("../Config/fire-admin");

const verify = async (req, res, next) => {
  if (req.session.auth) {
    const email = req.session.auth[0].logindetails.email;

    try {
      await firebase.firestore().runTransaction(async (transaction) => {
        const data = await transaction
          .get(firebase.firestore().collection("students").doc(email))
          .then((res) => res.data());

        const institution = await transaction
          .get(
            firebase
              .firestore()
              .collection("institutions")
              .doc(data.InId.trim())
          )
          .then((res) => res.data());

        const response = [
          {
            logindetails: {
              StudId: data.StudId.trim(),
              InId: data.InId.trim(),
              SemId: data.SemId.trim(),
              profile: data.profile.trim(),
              DepId: data.DepId.trim(),
              type: data.type.trim(),
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              email: data.email.trim(),
              googleAuth: data.googleAuth,
            },
            student: {
              InId: data.InId,
              DepId: data.DepId,
              SemId: data.SemId,
              StudId: data.StudId,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              gender: data.gender,
              profile: data.profile,
              bloodGroup: data.bloodGroup,
              religion: data.religion,
              title: data.title,
              country: data.country,
              state: data.state,
              district: data.district,
              contMob: data.contMob,
              age: data.age,
              qualification: data.qualification,
              dob: data.dob.toDate().toDateString(),
              pincode: data.pincode,
              fathName: data.fathName,
              fathOccu: data.fathOccu,
              fathMob: data.fathMob,
              mothName: data.mothName,
              mothOccu: data.mothOccu,
              mothMob: data.mothMob,
              community: data.community,
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
              crAt: data.crAt.toDate().toDateString(),
              modAt: data.modAt.toDate().toDateString(),
              depName: data.depName,
              googleAuth: data.googleAuth,
              type: data.type,
              semName: data.semName,
              contactAddress1: data.contactAddress1,
              contactAddress2: data.contactAddress2,
              contactAddress3: data.contact_address3,
              addmisNo: data.addmisNo,
            },
          },
        ];
        req.session.auth = response;
        return res.status(200).send({
          status: 200,
          data: response[0],
          message: "login successful!",
        });
      });
    } catch (err) {
      return res.status(400).send({
        status: 400,
        error: err,
      });
    }
  } else {
    next();
  }
};

const loginAccount = async (req, res, next) => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const IdToken = req.headers.authorization.split("Bearer ")[1];
    await firebase
      .auth()
      .verifyIdToken(IdToken)
      .then(async (decodedToken) => {
        const email = decodedToken.email;

        try {
          await firebase.firestore().runTransaction(async (transaction) => {
            //get student
            const data = await transaction
              .get(firebase.firestore().collection("students").doc(email))
              .then((res) => res.data());

            //get institute data
            const institution = await transaction
              .get(
                firebase
                  .firestore()
                  .collection("institutions")
                  .doc(data.InId.trim())
              )
              .then((res) => res.data());

            //update lastlogin
            await transaction.update(
              firebase.firestore().collection("students").doc(email),
              { lastLogin: firebase.firestore.FieldValue.serverTimestamp() }
            );

            const response = [
              {
                logindetails: {
                  StudId: data.StudId.trim(),
                  InId: data.InId.trim(),
                  DepId: data.DepId.trim(),
                  SemId: data.SemId.trim(),
                  profile: data.profile.trim(),
                  type: data.type.trim(),
                  firstName: data.firstName.trim(),
                  lastName: data.lastName.trim(),
                  email: data.email.trim(),
                  googleAuth: data.googleAuth,
                },
                student: {
                  InId: data.InId,
                  DepId: data.DepId,
                  SemId: data.SemId,
                  StudId: data.StudId,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                  gender: data.gender,
                  profile: data.profile,
                  bloodGroup: data.bloodGroup,
                  religion: data.religion,
                  title: data.title,
                  country: data.country,
                  state: data.state,
                  district: data.district,
                  contMob: data.contMob,
                  age: data.age,
                  qualification: data.qualification,
                  dob: data.dob.toDate().toDateString(),
                  pincode: data.pincode,
                  fathName: data.fathName,
                  fathOccu: data.fathOccu,
                  fathMob: data.fathMob,
                  mothName: data.mothName,
                  mothOccu: data.mothOccu,
                  mothMob: data.mothMob,
                  community: data.community,
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
                  crAt: data.crAt.toDate().toDateString(),
                  modAt: data.modAt.toDate().toDateString(),
                  depName: data.depName,
                  googleAuth: data.googleAuth,
                  type: data.type,
                  semName: data.semName,
                  contactAddress1: data.contactAddress1,
                  contactAddress2: data.contactAddress2,
                  contactAddress3: data.contact_address3,
                  addmisNo: data.addmisNo,
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
          return res.status(400).send({
            status: 400,
            error: err,
          });
        }
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

  next();
};

const googleLogin = async (req, res) => {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const IdToken = req.headers.authorization.split("Bearer ")[1];
    await firebase
      .auth()
      .verifyIdToken(IdToken)
      .then(async (decodedToken) => {
        const email = decodedToken.email;

        try {
          await firebase.firestore().runTransaction(async (transaction) => {
            //get student
            const data = await transaction
              .get(firebase.firestore().collection("students").doc(email))
              .then((res) => res.data());

            if (!data) {
              return res.status(404).send({
                status: 404,
                error: "not found",
                message: "student not linked",
              });
            }

            if (!data.googleAuth) {
              return res.status(404).send({
                status: 404,
                error: "account not linked",
                message: "account not linked",
              });
            }

            //get institute data
            const institution = await transaction
              .get(
                firebase
                  .firestore()
                  .collection("institutions")
                  .doc(data.InId.trim())
              )
              .then((res) => res.data());

            //update lastlogin
            await transaction.update(
              firebase.firestore().collection("students").doc(email),
              { lastLogin: firebase.firestore.FieldValue.serverTimestamp() }
            );

            const response = [
              {
                logindetails: {
                  StudId: data.StudId.trim(),
                  InId: data.InId.trim(),
                  DepId: data.DepId.trim(),
                  SemId: data.SemId.trim(),
                  profile: data.profile.trim(),
                  type: data.type.trim(),
                  firstName: data.firstName.trim(),
                  lastName: data.lastName.trim(),
                  email: data.email.trim(),
                  googleAuth: data.googleAuth,
                },
                student: {
                  InId: data.InId,
                  DepId: data.DepId,
                  SemId: data.SemId,
                  StudId: data.StudId,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                  gender: data.gender,
                  profile: data.profile,
                  bloodGroup: data.bloodGroup,
                  religion: data.religion,
                  title: data.title,
                  country: data.country,
                  state: data.state,
                  district: data.district,
                  contMob: data.contMob,
                  age: data.age,
                  qualification: data.qualification,
                  dob: data.dob.toDate().toDateString(),
                  pincode: data.pincode,
                  fathName: data.fathName,
                  fathOccu: data.fathOccu,
                  fathMob: data.fathMob,
                  mothName: data.mothName,
                  mothOccu: data.mothOccu,
                  mothMob: data.mothMob,
                  community: data.community,
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
                  crAt: data.crAt.toDate().toDateString(),
                  modAt: data.modAt.toDate().toDateString(),
                  depName: data.depName,
                  googleAuth: data.googleAuth,
                  type: data.type,
                  semName: data.semName,
                  contactAddress1: data.contactAddress1,
                  contactAddress2: data.contactAddress2,
                  contactAddress3: data.contact_address3,
                  addmisNo: data.addmisNo,
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
          return res.status(400).send({
            status: 400,
            error: err,
          });
        }
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
};

const createAccount = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email && password) {
      await firebase
        .auth()
        .createUser({
          email: email.trim(),
          password: password.trim(),
        })
        .then(async (user) => {
          //update student ID
          await firebase
            .firestore()
            .collection("students")
            .doc(email.trim())
            .set(
              {
                StudId: user.uid,
              },
              { merge: true }
            )
            .then(async () => {
              await firebase.firestore().runTransaction(async (transaction) => {
                //get student data
                const data = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collection("students")
                      .doc(email.trim())
                  )
                  .then((res) => res.data());

                //get institute data
                const institution = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collection("institutions")
                      .doc(data.InId.trim())
                  )
                  .then((res) => res.data());

                //get subjects
                const subjects = await transaction
                  .get(
                    firebase
                      .firestore()
                      .collection(
                        `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/semesters/${data.SemId.trim()}/subjects/`
                      )
                  )
                  .then((res) =>
                    res.docs.map((doc) => {
                      const data = doc.data();
                      const id = doc.id;
                      return { _id: id, ...data };
                    })
                  );

                //add new student to institute
                await transaction.set(
                  firebase
                    .firestore()
                    .collection("institutions")
                    .doc(data.InId.trim()),
                  {
                    students: [...institution.students, user.uid],
                  },
                  { merge: true }
                );

                //add student to database
                await transaction.set(
                  firebase
                    .firestore()
                    .collection(
                      `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/students/`
                    )
                    .doc(user.uid.trim()),
                  data
                );

                //add attendance
                await transaction.set(
                  firebase
                    .firestore()
                    .collection(
                      `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/semesters/${data.SemId.trim()}/attendance/`
                    )
                    .doc(data.StudId.trim()),
                  {
                    DepId: data.DepId.trim(),
                    InId: data.InId.trim(),
                    SemId: data.SemId.trim(),
                    StudId: data.StudId.trim(),
                    currentMonthPercentage: 0,
                    overAllPeriods: 0,
                    overAllPrecent: 0,
                    overAllPercentage: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    attendanceLog: [],
                    subjectList: subjects.map((subject) => {
                      return {
                        SubId: subject._id,
                        subName: subject.subName,
                        subCode: subject.subCode,
                        crAt: subject.crAt,
                        crBy: subject.crBy,
                        classes: {},
                        currentMonthPercentage: 0,
                        overAllPercentage: 0,
                        overAllPeriods: 0,
                        overAllPrecent: 0,
                      };
                    }),
                  }
                );

                const response = [
                  {
                    logindetails: {
                      StudId: data.StudId.trim(),
                      InId: data.InId.trim(),
                      DepId: data.DepId.trim(),
                      SemId: data.SemId.trim(),
                      profile: data.profile.trim(),
                      type: data.type.trim(),
                      firstName: data.firstName.trim(),
                      lastName: data.lastName.trim(),
                      email: data.email.trim(),
                      googleAuth: data.googleAuth,
                    },
                    student: {
                      InId: data.InId,
                      DepId: data.DepId,
                      SemId: data.SemId,
                      StudId: data.StudId,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      email: data.email,
                      gender: data.gender,
                      profile: data.profile,
                      bloodGroup: data.bloodGroup,
                      religion: data.religion,
                      title: data.title,
                      country: data.country,
                      state: data.state,
                      district: data.district,
                      contMob: data.contMob,
                      age: data.age,
                      qualification: data.qualification,
                      dob: data.dob.toDate().toDateString(),
                      pincode: data.pincode,
                      fathName: data.fathName,
                      fathOccu: data.fathOccu,
                      fathMob: data.fathMob,
                      mothName: data.mothName,
                      mothOccu: data.mothOccu,
                      mothMob: data.mothMob,
                      community: data.community,
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
                      crAt: data.crAt.toDate().toDateString(),
                      modAt: data.modAt.toDate().toDateString(),
                      depName: data.depName,
                      googleAuth: data.googleAuth,
                      type: data.type,
                      semName: data.semName,
                      contactAddress1: data.contactAddress1,
                      contactAddress2: data.contactAddress2,
                      contactAddress3: data.contact_address3,
                      addmisNo: data.addmisNo,
                    },
                  },
                ];
                req.session.auth = response;
                return res.status(200).send({
                  status: 200,
                  data: response[0],
                  message: "login successful!",
                });
              });
            });
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(409).send({
      status: 409,
      error: err,
      message: err.message,
    });
  }
};

const GetAttendance = async (req, res) => {
  const { InId, DepId, SemId, StudId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("attendance")
      .where("InId", "==", InId)
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("StudId", "==", StudId.trim())
      .get()
      .then((res) => res.docs.map((res) => res.data()));

    if (!data.length) {
      return res.status(404).send({
        status: 404,
        err: "not found!",
      });
    }
    return res.status(200).send({
      status: 200,
      data: data.map((obj) => ({
        ...obj,
        overAllPercentage: parseInt(
          (obj.overAllPrecent / obj.overAllPeriods) * 100
        ),
        subjects: obj.subjectList.map((subject) => ({
          code: subject.subCode.toString(),
          name: subject.subName.toString().toUpperCase(),
          [subject.subName.toString().toUpperCase()]: parseInt(
            (subject.overAllPrecent / subject.overAllPeriods) * 100
          ),
        })),
      })),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetAssignment = async (req, res) => {
  const { InId, DepId, SemId, StudId } = req.body;
  try {
    if (InId && DepId && SemId && StudId) {
      const data = await firebase
        .firestore()
        .collectionGroup("assignments")
        .where("InId", "==", InId.trim())
        .where("DepId", "==", DepId.trim())
        .where("SemId", "==", SemId.trim())
        .where("students", "array-contains-any", [StudId.trim()])
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
        data: data.map((data) => ({
          _id: data.id.toString().trim(),
          startingDate: data.date.toDate().toDateString(),
          endingDate: data.dueDate.toDate().toDateString(),
          project: data.project.toString().trim(),
          status: data.studentsStatus
            .find((student) => student.StudId === StudId)
            ["status"].toString()
            .toUpperCase(),
        })),
      });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const UploadAssignment = async (req, res) => {
  const { name, StudId, InId, SemId, DepId, AssgId } = req.body;
  const file = req.files.file;
  if (req.files === null) {
    res.status(400).send({ status: 400, error: "No file uploaded!" });
  }

  const location = `./Assets/assignments/IN${InId}-ASS${AssgId}-STUD${StudId}-${file.name}`;
  file.mv(location, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
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
            studentStatusToUpdate.status = "CHECKING";
            studentStatusToUpdate.file = `IN${InId}-ASS${AssgId}-STUD${StudId}-${file.name}`;

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
      return res.status(400).send({ status: 400, error: err });
    }
  });
};

const GetExams = async (req, res) => {
  const { InId, DepId, SemId, StudId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("exams")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("students", "array-contains-any", [StudId.trim()])
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
        subject: obj.subject.toString().trim(),
        subjectCode: obj.subCode.toString().trim(),
        examCode: obj.examCode.toString().trim(),
        date: obj.date.toDate().toDateString(),
        startingTime: obj.startingTime
          .toDate()
          .toLocaleTimeString()
          .toUpperCase(),
        endingTime: obj.endingTime.toDate().toLocaleTimeString().toUpperCase(),
        status: obj.studentsStatus
          .find((student) => student.StudId === StudId)
          ["status"].toString()
          .trim()
          .toUpperCase(),
        description: obj.description.toString().trim(),
      })),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const UploadExam = async (req, res) => {
  const { name, StudId, InId, SemId, DepId, ExamId } = req.body;
  const file = req.files.file;
  if (req.files === null) {
    res.status(400).send({ status: 400, error: "No file uploaded!" });
  }

  const location = `./Assets/exams/IN${InId}-Exam${ExamId}-STUD${StudId}-${file.name}`;
  file.mv(location, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }
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
            studentStatusToUpdate.status = "CHECKING";
            studentStatusToUpdate.file = `IN${InId}-Exam${ExamId}-STUD${StudId}-${file.name}`;

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
      res.status(400).send({
        status: 400,
        error: err,
        message: err,
      });
    }
  });
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
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetClasses = async (req, res) => {
  const { InId, DepId, SemId, StudId, ClsDate } = req.body;
  //Date format "2021-08-24 12:00:00:AM"
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
            .where("students", "array-contains-any", [StudId.trim()])
            .where(
              "date",
              "==",
              firebase.firestore.Timestamp.fromMillis(
                new Date(ClsDate + " " + "12:00:00:AM")
              )
            )
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
                      .where("StudId", "==", StudId.trim())
                  )
                  .then(
                    (docs) =>
                      docs.docs.map((doc) => {
                        const data = doc.data();
                        const attendance = data.attendanceLog.find(
                          (cls) => cls.ClsId == id
                        );
                        return attendance;
                      })[0]
                  );

                return { id, attendance, ...data };
              })
            )
        );

      if (!data.length) {
        return res.status(200).send({
          status: 404,
          err: "not found!",
        });
      }

      const timeDeff = (start, end) => {
        var diff = (start - end) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
      };

      return res.status(200).send({
        status: 200,
        data: data.map((obj) => ({
          _id: obj.id,
          InId: obj.InId,
          DepId: obj.DepId,
          SemId: obj.SemId,
          StaffId: obj.StaffId,
          attendance: obj.attendance.status.toUpperCase().toString(),
          date: obj.date.toDate().toDateString().toUpperCase(),
          start: obj.startingTime
            .toDate()
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toUpperCase(),
          end: obj.endingTime
            .toDate()
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .toUpperCase(),
          meeting: obj.meeting.join_url ? obj.meeting : false,
          duration: timeDeff(
            obj.startingTime.toDate(),
            obj.endingTime.toDate()
          ),
          subject: obj.subject.toString().trim(),
          subId: obj.SubId.toString().trim(),
          chapter: obj.chapter.toString().trim(),
          staffName: obj.staffName.toString().trim(),
        })),
      });
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const AddAttendance = async (req, res) => {
  const { InId, DepId, SemId, StudId, SubId, ClsId } = req.body;
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

            attendanceLogToUpdate.status = "PRECENT";

            attendanceLog[
              attendanceLog.findIndex((log) => log.ClsId == ClsId.trim())
            ] = attendanceLogToUpdate;

            const subjectToupdate =
              subjectList[
                subjectList.findIndex(
                  (subject) => subject.SubId === SubId.trim()
                )
              ];

            subjectToupdate.overAllPrecent = subjectToupdate.overAllPrecent + 1;

            subjectToupdate.classes = {
              ...subjectToupdate.classes,
              [ClsId.trim()]: {
                ...subjectToupdate.classes[ClsId.trim()],
                status: "PRECENT",
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
                overAllPrecent: firebase.firestore.FieldValue.increment(+1),
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

const GetBillings = async (req, res) => {
  const { InId, DepId, SemId, StudId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("billings")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("students", "array-contains-any", [StudId.trim()])
      .get()
      .then((res) =>
        res.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        })
      );

    if (!data.length) {
      return res.status(200).send({
        status: 404,
        err: "not found!",
      });
    }

    return res.status(200).send({
      status: 200,
      data: data.map((obj) => ({
        _id: obj.id,
        billNo: obj.billNo.toString().trim(),
        billItem: obj.billItem.toString().trim(),
        billDescription: obj.billDescription.toString().trim(),
        amount: parseInt(obj.amount.trim()),
        dueDate: obj.dueDate.toDate().toDateString().toUpperCase(),
        pendingAmount: parseInt(obj.outstandingAmount.trim()),
        paymentStatus: obj.paymentStatus.toString().trim().toUpperCase(),
        method: obj.method.toString().trim().toUpperCase(),
      })),
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const AddFeedBack = (req, res) => {
  const { InId, DepId, SemId, StudId, Message, Email, Name } = req.body;
  try {
    firebase
      .firestore()
      .collection(
        `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/feedback/`
      )
      .add({
        InId: InId.trim(),
        DepId: DepId.trim(),
        SemId: SemId.trim(),
        CratedAt: firebase.firestore.FieldValue.serverTimestamp(),
        StudId: StudId.trim(),
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

const GetProfile = (req, res) => {
  res.download(`./Assets/studentProfiles/${req.params.path}`);
};

module.exports = {
  loginAccount,
  googleLogin,
  createAccount,
  verify,
  GetAttendance,
  GetAssignment,
  GetBillings,
  UploadAssignment,
  GetExams,
  UploadExam,
  GetHolidays,
  GetClasses,
  AddAttendance,
  AddFeedBack,
  GetProfile,
};
