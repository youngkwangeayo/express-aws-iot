import { body, param } from "express-validator";
import validateResultHandler from "./index.js";

const allowLang = ["en", "ja", "de", "zh"];

const validateMenuListTranslation = [
    body("frId")
        .isInt().withMessage("frId is required. must be an integer")
        .toInt(),
    body("lang")
        .optional().isArray().isIn(allowLang)
        .default(allowLang).withMessage(`lang must be an array is in ${allowLang} `),
    validateResultHandler
];

const validateMenuTranslation = [
    body("frId")
        .isInt().withMessage("frId is required. must be an integer")
        .toInt(),
    param("lang")
        .isString().withMessage("lang must be a string")
        .isIn(allowLang).withMessage(`lang must be either ${allowLang}`),

    validateResultHandler
];

export { validateMenuTranslation, validateMenuListTranslation };
