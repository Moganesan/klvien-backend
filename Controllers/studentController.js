const firebase = require("../Config/fire-admin");

const verifySession = async (req, res, next) => {
  try {
    if (req.session.auth) {
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
            DepId: data.DepId,
            type: data.type,
            name: data.Name,
            email: data.Email,
            Gauth: data.googleAuth,
          },
          token: decodedToken,
          student: {
            fname: data.Name,
            lname: data.last_name,
            gender: data.sex,
            dob: data.dob.toDate().toDateString(),
            profile: decodedToken.picture,
            fatname: data.father_name,
            depname: data.dep_name,
            motname: data.mother_name,
            religion: data.religion,
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
      req.session.reload(() => {
        req.session.auth = response;
      });
      res.status(200).send({
        status: 200,
        data: response[0],
        message: "login successful",
      });
    }
    return res.send("unathorized");
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
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

const GetAttendance = async (req, res) => {
  const { InId, DepId, SemId, StudId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("attendance")
      .where("InId", "==", InId)
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("StuID", "==", StudId.trim())
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
        subjects: Object.keys(obj.subjectList).map((key, index) => ({
          code: obj.subjectList[key].SubCode.toString(),
          name: obj.subjectList[key].SubName.toString().toUpperCase(),
          [obj.subjectList[key].SubName.toString().toUpperCase()]: parseInt(
            obj.subjectList[key].OverAllpercentage
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
        status: data.studentsStatus[StudId].status
          .toString()
          .toUpperCase()
          .trim(),
        description: data.Descriptions.trim(),
      })),
    });
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
        status: obj.studentsStatus[StudId].status
          .toString()
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
    await firebase
      .firestore()
      .collectionGroup("attendance")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .where("StuID", "==", StudId.trim())
      .get()
      .then((data) => {
        data.docs.map((doc) => {
          firebase
            .firestore()
            .collection(
              `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/${StudId}/subjectList`
            )
            .doc(SubId.trim())
            .set(
              {
                classes: {
                  [ClsId]: {
                    status: "precent",
                  },
                },
              },
              { merge: true }
            )
            .then(() => {
              firebase
                .firestore()
                .collection(
                  `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                )
                .doc(StudId.trim())
                .set(
                  {
                    OverAllPrecent: firebase.firestore.FieldValue.increment(+1),
                  },
                  { merge: true }
                );
            })
            .then(() => {
              firebase
                .firestore()
                .collection(
                  `/institutions/${InId.trim()}/departments/${DepId.trim()}/semesters/${SemId.trim()}/attendance/`
                )
                .doc(StudId.trim())
                .set(
                  {
                    subjectList: {
                      [SubId]: {
                        overAllPrecent:
                          firebase.firestore.FieldValue.increment(+1),
                      },
                    },
                  },
                  { merge: true }
                );
            })
            .then((response) => res.send({ status: 200, data: response }))
            .catch((err) => req.send({ status: 500, error: err }));
        });
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

module.exports = {
  loginAccount,
  googleLogin,
  createAccount,
  verifySession,
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
};
