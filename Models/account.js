const joi = require("joi");

const saccount = joi
  .object({
    name: joi.string().required(),
    mobile: joi.number().required().min(10),
    rollNo: joi.string(),
    class: joi.string().required(),
    section: joi.string().required(),
    address: joi.string().required(),
    bloodGroup: joi.string(),
    fatherName: joi.string().required(),
    motherName: joi.string().required(),
    community: joi.string(),
  })
  .unknown(true);

module.exports = { saccount };
