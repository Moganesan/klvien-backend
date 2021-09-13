const firebase = require("../Config/fire-admin");

const verify = async (req, res, next) => {
  if (req.session.auth) {
    const email = req.session.auth[0].logindetails.email;
    const data = await firebase
      .firestore()
      .collection("students")
      .doc(email)
      .get()
      .then((res) => res.data());

    const institution = await firebase
      .firestore()
      .collection("institutions")
      .doc(data.InId.trim())
      .get()
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
  } else {
    next();
  }
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

          //get student
          const data = await firebase
            .firestore()
            .collection("students")
            .doc(email)
            .get()
            .then((res) => res.data());

          //get institute data
          const institution = await firebase
            .firestore()
            .collection("institutions")
            .doc(data.InId.trim())
            .get()
            .then((res) => res.data());

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
      .collection("students")
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
          Gauth: data.googleAuth,
        },
        student: {
          fname: data.Name,
          lname: data.last_name,
          gender: data.sex,
          dob: data.dob.toDate().toDateString(),
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
            );

          //get student data
          const data = await firebase
            .firestore()
            .collection("students")
            .doc(email.trim())
            .get()
            .then((res) => res.data());

          //get institute data
          const institution = await firebase
            .firestore()
            .collection("institutions")
            .doc(data.InId.trim())
            .get()
            .then((res) => res.data());

          //add new student to institute
          await firebase
            .firestore()
            .collection("institutions")
            .doc(data.InId.trim())
            .set(
              {
                students: [...institution.students, user.uid],
              },
              { merge: true }
            );

          //add student to database
          await firebase
            .firestore()
            .collection(
              `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/students/`
            )
            .doc(user.uid.trim())
            .set(data);

          //get subjects
          const subjects = await firebase
            .firestore()
            .collection(
              `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/semesters/${data.SemId.trim()}/subjects/`
            )
            .get()
            .then((res) =>
              res.docs.map((doc) => {
                const data = doc.data();
                const id = doc.id;
                return { _id: id, ...data };
              })
            );

          //add attendance
          await firebase
            .firestore()
            .collection(
              `/institutions/${data.InId.trim()}/departments/${data.DepId.trim()}/semesters/${data.SemId.trim()}/attendance/`
            )
            .doc(data.StudId.trim())
            .set({
              DepId: data.DepId.trim(),
              InId: data.InId.trim(),
              SemId: data.SemId.trim(),
              StudId: data.StudId.trim(),
              currentMonthPercentage: 0,
              overAllPeriods: 0,
              overAllPrecent: 0,
              overAllPercentage: 0,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
            });

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
        })
        .catch((err) => {
          return res.status(409).send({
            status: 409,
            error: err,
            message: err.message,
          });
        });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
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
          startingDate: data.startingDate.toDate().toDateString(),
          endingDate: data.endingDate.toDate().toDateString(),
          project: data.Project.toString().trim(),
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

    await firebase
      .firestore()
      .collectionGroup("assignments")
      .where("_id", "==", AssgId.trim())
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("students", "array-contains-any", [StudId.trim()])
      .get()
      .then((res) => {
        res.docs.map((doc) => {
          const data = doc.data();
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/assignments/`
            )
            .doc(AssgId.trim())
            .set(
              {
                studentsStatus: {
                  [StudId]: {
                    StudId: "TEuCqkVonRgvzvfYU86z",
                    status: "Checking",
                    file: location,
                  },
                },
              },
              { merge: true }
            );
        });
      });
    return res.send({
      status: 200,
      message: "success",
    });
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
        subjectCode: obj.subject_code.toString().trim(),
        examCode: obj.exam_code.toString().trim(),
        date: obj.date.toDate().toDateString(),
        startingTime: obj.starting_time
          .toDate()
          .toLocaleTimeString()
          .toUpperCase(),
        endingTime: obj.ending_time.toDate().toLocaleTimeString().toUpperCase(),
        status: obj.studentsStatus
          .find((student) => student.StudId === StudId)
          ["status"].toString()
          .trim()
          .toUpperCase(),
        description: obj.description.toString().trim(),
      })),
    });
  } catch (err) {
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
      console.log(err);
      return res.status(500).send(err);
    }

    await firebase
      .firestore()
      .collectionGroup("exams")
      .where("_id", "==", ExamId.trim())
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("students", "array-contains-any", [StudId.trim()])
      .get()
      .then((res) => {
        res.docs.map((doc) => {
          const data = doc.data();
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/exams/`
            )
            .doc(ExamId.trim())
            .set(
              {
                studentsStatus: {
                  [StudId]: {
                    StudId: "TEuCqkVonRgvzvfYU86z",
                    status: "Checking",
                    file: location,
                  },
                },
              },
              { merge: true }
            );
        });
      });
    return res.send({
      status: 200,
      message: "success",
    });
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
        startingDate: obj.starting_date.toDate().toDateString().toUpperCase(),
        endingDate: obj.ending_date.toDate().toDateString().toUpperCase(),
        message: obj.message.toString().trim(),
      })),
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetClasses = async (req, res) => {
  const { InId, DepId, SemId, StudId, ClsDate } = req.body;
  //Date format "2021-08-24 12:00:00:AM"
  try {
    const data = await firebase
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
        date: obj.date.toDate().toDateString().toUpperCase(),
        start: obj.start
          .toDate()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toUpperCase(),
        end: obj.end
          .toDate()
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toUpperCase(),
        meeting: obj.meeting.join_url ? obj.meeting : false,
        duration: timeDeff(obj.start.toDate(), obj.end.toDate()),
        subject: obj.SubName.toString().trim(),
        subId: obj.SubId.toString().trim(),
        chapter: obj.ChapterName.toString().trim(),
        staffName: obj.StaffName.toString().trim(),
      })),
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const AddAttendance = async (req, res) => {
  const { InId, DepId, SemId, StudId, SubId, ClsId } = req.body;
  try {
    // return console.log(SubId + " " + ClsId);
    await firebase
      .firestore()
      .collectionGroup("attendance")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("StudId", "==", StudId.trim())
      .get()
      .then((data) => {
        data.docs.map(async (doc) => {
          const data = doc.data();
          const subjectList = data.subjectList;

          // Assing desired element of object to local javascript variable

          const subjectToupdate =
            subjectList[
              subjectList.findIndex((subject) => subject.SubId === SubId.trim())
            ];

          // Update field of the element assigned to local javascript variable

          subjectToupdate.classes = {
            ...subjectToupdate.classes,
            [ClsId]: {
              ...subjectToupdate.classes[ClsId],
              status: "precent",
            },
          };

          // reassign object to local array variable
          subjectList[
            subjectList.findIndex((subject) => subject.SubId === SubId.trim())
          ] = subjectToupdate;

          await firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
            )
            .doc(StudId.trim())
            .set(
              {
                overAllPrecent: firebase.firestore.FieldValue.increment(+1),
                subjectList: subjectList,
              },
              { merge: true }
            )
            .then((response) => res.send({ status: 200, data: response }))
            .catch((err) => res.send({ status: 500, error: err }));
        });
      })
      .catch((err) => console.log(err));
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
