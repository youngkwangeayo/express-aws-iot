import axios from "axios";
import logger from "../config/logger.js";
import { debug } from "../config/logger.js";

/**
 * 텍스트 스트림 생성 (테스트용)
 * @param {string} text - 스트리밍할 텍스트
 * @param {object} options - 옵션 (chunkSize, delayMs)
 * @returns {AsyncGenerator} OpenAI 스타일 청크 스트림
 */
async function* testStream() {

    const stream = ["안녕하세요!", "이것은", "청크", "스트림", "테스트입니다.", "각 메시지는", "500ms", "간격으로", "전송됩니다."];

    debug(`텍스트 스트림 시작: 텍스트 길이=${stream.length}`);

    for (const chunk of stream) {
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    debug(`스트림 생성 완료: 총 ${stream.length}개 청크 전송`);
}



async function* runTranslateMenuProcess( frId, lang, cookie, authHeader ) {

    // callCMSMenu().then(test1_1).catch(err => console.error("task1 error:", err));
    
    // test1().then(test1_1).catch(err => console.error("task1 error:", err));
    // test2().then(test1_2).catch(err => console.error("task1 error:", err));


    yield "TEST";
    await new Promise(resolve => setTimeout(resolve, 3000));
    yield "2222222";
    
    // await Promise.all([ test1(),test2() ]);
    // await Promise.allSettled([task1(), task2()]);
}

async function callCMSMenu(frId, lang, cookie, authHeader) {


    let sample = await axios.get("https://dev-cms.nextpay.co.kr/menu/v1/getCategoryList?frId=10107", {
        headers: {
            Authorization: authHeader, // 그대로 전달
            Cookie: cookieString,      // 문자열로 변환 후 전달
        }
    });
    const result = sample.data.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo
    }));
    return result;
}

async function* callTranslationAgentToJson(json) {

}

const translatorAgentService = {
    testStream,
    callCMSMenu,
    runTranslateMenuProcess
};

export default translatorAgentService;