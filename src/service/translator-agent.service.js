import axios from "axios";
import logger from "../config/logger.js";
import { debug } from "../config/logger.js";
import cmsAgent from "../agent/cms-agent/agent.js";
import cmsWebClient from "../webclient/cms/index.js";

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



async function* runTranslateMenuProcess(frId, lang, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    let p1Result, p2Result, p3Result;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList().then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList().then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";
    
    let resultP1, resultP2, resultP3;
    const taskTranslateMenu = cmsAgent.translateJSON(p1Result, lang).then(r => resultP1 = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(p2Result).then(r => resultP2 = r).catch(err => console.error("task1 error:", err));
    const taskTranslateProduct = cmsAgent.translateJSON(p3Result).then(r => resultP3 = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]);
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskPostCategory = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskPostProduct = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};



async function* runMultipleTranslateMenuProcess(frId, lang, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    let p1Result, p2Result, p3Result;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList().then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList().then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";
    
    // for( lang)
    
    let resultP1, resultP2, resultP3;
    const taskTranslateMenu = cmsAgent.translateJSON(p1Result, lang).then(r => resultP1 = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(p2Result).then(r => resultP2 = r).catch(err => console.error("task1 error:", err));
    const taskTranslateProduct = cmsAgent.translateJSON(p3Result).then(r => resultP3 = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]);
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskPostCategory = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskPostProduct = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};



const translatorAgentService = {
    testStream,
    runTranslateMenuProcess,
};

export default translatorAgentService;


