const { validationResult, check, matchedData } = require("express-validator");
const { APIError } = require("../models/apiResponseModel");


function validateResultHandler(req, res, next) {

    // 최종 에러 핸들링
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // let message = errors.array();
        const error = APIError.build()
            .setStatusCode(400)
            .setMsg( JSON.stringify(errors.array()) );
        return next(error);
    };

    req.matchedData = matchedData(req);
    next();
};


const validateFrId = [

    check("frId").isInt().toInt().withMessage("상점아이디를 입력해주세요."),
    validateResultHandler
];


module.exports = {validateResultHandler, validateFrId};