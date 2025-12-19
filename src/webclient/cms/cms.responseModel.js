import { APIError } from "../../model/apiResponseModel.js";

class APIStatusMessage {

    static getReason(res){
        let message = "";
        if(res.status == 500) message = "서버처리 중 오류가 발생하였습니다.";
        else if ( res.status == 504 ) message = "요청 시간 타임아웃 발생하였습니다.";
        else if ( res.status == 400 ) message = "요청 정보가 잘못되었습니다.";
        else if ( res.status == 404 ) message = "유효하지 않은 요청 입니다.";
        else if ( res.status == 403 ) message = "접근 권한이 없습니다.";
        else if ( res.status == 401 ) message = "인증이 필요합니다.";
        else message = "알수없는 에러.";
        return message;
    };
};

class CMSResponseModel {
    constructor(result){
        this.code = result.code;
        this.message = result.msg ?? result.message; 
        this.data = result.data;
        
        if( this.code < 0) throw APIError.build().setCode(this.code).setMessage(this.message);
    };

};

export { CMSResponseModel };
