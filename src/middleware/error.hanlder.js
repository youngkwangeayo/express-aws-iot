import { APIError } from "../model/apiResponseModel.js";

// 에러핸들러
const errorHendler = (error, req, res, next) => {

  // console.log("\n",error.stack,"\n");
  // ---- error리턴은 cors 전체 허용 ----
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  // -------------------------------

  console.log(`[ERROR] [${res.locals.requestId}] ${JSON.stringify(error.stack)}`);

  const apiError = APIError.build().setStatusCode(error.statusCode || 500).setMessage(error.message || '처리 중 에러가 발생했습니다.');
  res.statusCode = apiError.statusCode;
  console.log(`[ERROR] [${res.locals.requestId}] Status : ${res.statusCode} / ${JSON.stringify(apiError)}`);

  res.status(res.statusCode).json(apiError);
};


export default errorHendler;