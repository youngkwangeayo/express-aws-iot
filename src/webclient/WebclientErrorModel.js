import { APIError } from "../model/apiResponseModel.js";
import { debug } from "../config/logger.js";

class WebclientError extends APIError {
    constructor(error, serverName) {
        const server = serverName || 'API';

        if (error.response) {
            // 서버가 응답했지만 상태 코드가 4xx, 5xx
            debug(`${server} 에러 응답: ${error.response.status}`, error.response.data);
            const message = `${server}에러 응답 ${error.response.data?.message || error.response.statusText}`;
            super(error.response.data?.code, error.response.status, message);
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못음 (타임아웃, 네트워크 에러)
            debug(`${server} 응답 없음`, error.message);
            const state = error.status ?? 503;
            super(-1, state, `${server} 서버에 연결할 수 없습니다`);
        } else {
            // 요청 설정 중 에러
            debug('요청 설정 에러', error.message);
            super(-1, error.status ?? 500, error.message);
        }
    }
}


export { WebclientError };
