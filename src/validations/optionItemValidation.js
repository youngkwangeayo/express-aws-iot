const { body, validationResult } = require("express-validator");
const { validateResultHandler } = require(".");

const validateProductOption = [
  body("menuCategoryId")
    .exists({ checkFalsy: true }).withMessage("menuCategoryId is required")
    .isInt().withMessage("menuCategoryId must be an integer")
    .toInt(),

  body("optionId")
    .exists({ checkFalsy: true }).withMessage("optionId is required")
    .isInt().withMessage("optionId must be an integer")
    .toInt(),

  body("optionGroupId")
    .exists({ checkFalsy: true }).withMessage("optionGroupId is required")
    .isInt().withMessage("optionGroupId must be an integer")
    .toInt(),

  body("optionType")
    .default("O")
    .isString().withMessage("optionType must be a string"),

  body("requiredYn")
    // .exists({ checkFalsy: true }).withMessage("requiredYn is required")
    .default("N")
    .isIn(["Y", "N"]).withMessage("requiredYn must be 'Y' or 'N'"),

  body("price")
    // .not().isEmpty().withMessage("price is required")
    .default(0)
    .isFloat().withMessage("price must be a number"),

  body("dcYn")
    .default("N")
    .isIn(["Y", "N"]).withMessage("dcYn must be 'Y' or 'N'"),

  body("dcAmount")
    .optional()
    .isFloat().withMessage("dcAmount must be a number"),

  body("listSeq")
    .optional()
    .isInt().withMessage("listSeq must be an integer")
    .toInt(),

  validateResultHandler
];

const validateIncludeOption = [
  body("menuCategoryId")
    .exists({ checkFalsy: true }).withMessage("menuCategoryId is required")
    .isInt().withMessage("menuCategoryId must be an integer")
    .toInt(),

  body("optionId")
    .exists({ checkFalsy: true }).withMessage("optionId is required")
    .isInt().withMessage("optionId must be an integer")
    .toInt(),

  body("optionGroupId")
    .exists({ checkFalsy: true }).withMessage("optionGroupId is required")
    .isInt().withMessage("optionGroupId must be an integer")
    .toInt(),

  body("optionType")
    .default("O")
    .isString().withMessage("optionType must be a string"),

  body("requiredYn")
    // .exists({ checkFalsy: true }).withMessage("requiredYn is required")
    .default("N")
    .isIn(["Y", "N"]).withMessage("requiredYn must be 'Y' or 'N'"),

  body("price")
    // .not().isEmpty().withMessage("price is required")
    .default(0)
    .isFloat().withMessage("price must be a number"),

  body("dcYn")
    .default("N")
    .isIn(["Y", "N"]).withMessage("dcYn must be 'Y' or 'N'"),

  body("dcAmount")
    .optional()
    .isFloat().withMessage("dcAmount must be a number"),

  body("listSeq")
    .optional()
    .isInt().withMessage("listSeq must be an integer")
    .toInt(),

  validateResultHandler
];

module.exports = { validateProductOption };
