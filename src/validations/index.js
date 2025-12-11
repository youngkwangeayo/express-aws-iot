import { validationResult, matchedData} from "express-validator";
import { APIError } from "../model/apiResponseModel.js";

function validateResultHandler(req, res, next) {

    // 최종 에러 핸들링
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // let message = errors.array();
        const error = APIError.build()
            .setStatusCode(400)
            .setMessage( errors.array() );
        return next(error);
    };

    req.matchedData = matchedData(req);
    next();
};


export default validateResultHandler;