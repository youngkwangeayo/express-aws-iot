import axios from "axios";
import logger from "../config/logger.js";
import { debug } from "../config/logger.js";
import cmsAgent from "../agent/cms-agent/agent.js";
import cmsWebClient from "../webclient/cms/index.js";
import { APIError } from "../model/apiResponseModel.js";

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



async function runTranslateMenuProcess(frId, lang, cookie, authHeader, resWrite) {
    const startTime = Date.now();
    const success = [];
    const failName = [];

    // 번역 작업들을 먼저 시작 (병렬 실행)
    const tasksPromise = Promise.allSettled([

        translateMenu(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("메뉴") }).catch(() => { failName.push("메뉴"); }),
        translateCategory(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("카테고리") }).catch(() => { failName.push("카테고리"); }),
        translateProduct(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("상품") }).catch(() => { failName.push("상품"); })

    ]).then(() => {
        isDone = true; // 모든 작업이 완료되면 isDone을 true로 설정
    });

    const words = ['AI가', '상품 번역', '작업 중', '입니다'];
    let wordIndex = 0;
    let isDone = false;
    // 작업이 진행되는 동안 진행 상황 메시지 출력
    while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 7000) continue;
        if (isDone) continue;
        wordIndex = (wordIndex % words.length) + 1;
        const message = words.slice(0, wordIndex).join(' ');
        resWrite(message);
    }

    // 작업이 모두 완료될 때까지 대기 (혹시 모를 race condition 방지)
    await tasksPromise;

    let endingment = `(${success.join(",")}) ${success.length}개 성공!! `;
    if (failName.length !== 0) endingment += (` , ${failName.join(",")} 번역 저장에는 실패하였습니다.`);
    resWrite(endingment);
};




async function translateMenu(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateMenu START ");

    resWrite("CMS에서 메뉴 API 조회 합니다.");
    const taskResult_menu = await cmsWebClient.getMenuList(frId, lang, cookie, authHeader);

    resWrite("AI가 메뉴 번역 시작합니다.");
    const taskResoult_transMenu = await cmsAgent.translateJSON(taskResult_menu, lang);
    resWrite("AI가 메뉴 번역을 완료 하였습니다.");

    const taskResult_SaveMenuResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader);
    resWrite("CMS에서 메뉴 저장 완료.");
    
    debug("===translateMenu DONE ");
};

async function translateCategory(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateCategory STRAT ");

    resWrite("CMS에서 카테고리 API 조회 합니다.");
    const taskResult_category = await cmsWebClient.getCategoryList(frId, lang, cookie, authHeader);

    resWrite("AI가 카테고리 번역 시작합니다.");
    const taskResoult_transCategory = await cmsAgent.translateJSON(taskResult_category, lang);
    resWrite("AI가 카테고리 번역을 완료 하였습니다.");

    const taskResult_SaveCategoryResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transCategory, cookie, authHeader);
    resWrite("CMS에서 카테고리 저장 완료.");

    debug("===translateCategory DONE ");
};

async function translateProduct(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateProduct START ");

    resWrite("CMS에서 상품 API 조회 합니다.");
    const taskResult_product = await cmsWebClient.getProductList(frId, lang, cookie, authHeader);

    resWrite("AI가 상품 번역 시작합니다.");
    const taskResoult_transProduct = await cmsAgent.translateJSON(taskResult_product, lang);
    resWrite("AI가 상품 번역을 완료 하였습니다.");

    const taskResult_SaveProductResult = await cmsWebClient.postMenuTranslationList(frId, taskResoult_transProduct, cookie, authHeader);
    resWrite("CMS에서 상품 저장 완료.");

    debug("===translateProduct DONE ");
};


const translatorAgentService = {
    testStream,
    runTranslateMenuProcess,
};

export default translatorAgentService;


