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
        name: obj.Name,
        lname: obj.last_name,
        profile: obj.profile,
        country: obj.country,
        state: obj.state,
        pincode: obj.pincode,
        district: obj.district,
        addmisNo: obj.admission_number,
        InId: obj.InId,
        DepId: obj.DepId,
        depName: obj.dep_name,
        SemId: obj.SemId,
        semName: obj.sem_name,
        email: obj.Email,
        sex: obj.sex,
        bloodGroup: obj.blood_group,
        contAdd1: obj.contact_address1,
        contAdd2: obj.contact_address2,
        contAdd3: obj.contact_address3,
        contMob: obj.contact_mobile,
        fathName: obj.father_name,
        fathOccu: obj.father_occupation,
        fathMob: obj.father_mobile,
        mothName: obj.mother_name,
        mothOccu: obj.mother_occupation,
        mothMob: obj.mother_mobile,
        age: obj.age,
        qualification: obj.qualification,
        title: obj.title.toUpperCase(),
        StudId: obj.StudId,
        googleAuth: obj.googleAuth,
        dob: obj.dob.toDate().toDateString(),
        community: obj.community,
        city: obj.city,
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
  }
};

const GetAssignments = async (req, res) => {
  const { InId, DepId, SemId } = req.body;
  try {
    const data = await firebase
      .firestore()
      .collectionGroup("assignments")
      .where("InId", "==", InId.trim())
      .where("DepId", "==", DepId.trim())
      .where("SemId", "==", SemId.trim())
      .get()
      .then(
        async (res) =>
          await Promise.all(
            res.docs.map(async (doc) => {
              const projdata = doc.data();
              const id = doc.id;
              const studentsData = [];
              await Promise.all(
                Object.keys(projdata.studentsStatus).map(async (key, index) => {
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
                          sex: data.sex,
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
                          projStatus: {
                            status: projdata.studentsStatus[data.StudId].status,
                            file: projdata.studentsStatus[data.StudId].file,
                          },
                        });
                      })
                    );
                })
              );

              return { id, studentsDetails: studentsData, ...projdata };
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
        DepId: obj.DepId.trim(),
        SemId: obj.SemId.trim(),
        InId: obj.InId.trim(),
        project: obj.Project.trim(),
        startingDate: obj.startingDate.toDate().toDateString(),
        endingDate: obj.endingDate.toDate().toDateString(),
        subject: obj.Subject.trim(),
        students: obj.studentsDetails,
      })),
      items: Object.keys(data).length,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, error: err });
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
                          sex: data.sex,
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

              await Promise.all(
                classdata.students.map(async (studId) => {
                  await firebase
                    .firestore()
                    .collection("students")
                    .where("StudId", "==", studId.trim())
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
                          sex: data.sex,
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
                        });
                      })
                    );
                })
              );

              return { id, studentsDetails: studentsData, ...classdata };
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
  const file = req.files.file;
  if (req.files === null) {
    res.status(400).send({ status: 400, error: "No file uploaded!" });
  }
  const fileName = name.split(/\s/).join("");

  const location = `./Assets/studentProfiles/IN${InId}-STUD${StudId}-${fileName}`;
  file.mv(location, async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    await firebase
      .firestore()
      .collection("students")
      .where("StudId", "==", StudId.trim())
      .get()
      .then((res) => {
        res.docs.map((doc) => {
          const data = doc.data();
          const email = data.Email;
          firebase
            .firestore()
            .collection("/students")
            .doc(email.trim())
            .set(
              {
                profile: `IN${InId}-STUD${StudId}-${fileName}`,
              },
              { merge: true }
            )
            .then((res) => console.log(res));
        });
      });
    return res.send({
      status: 200,
      message: "success",
    });
  });
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
  GetAssignments,
  GetExams,
  GetClasses,
  UploadProfile,
  GetStudentProfile,
};
