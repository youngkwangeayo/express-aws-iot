import axios from "axios";
import logger from "../config/logger.js";
import { debug } from "../config/logger.js";
import cmsAgent from "../agent/cms-agent/agent.js";
import cmsWebClient from "../webclient/cms/cms.client.js";
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
    const failMessage = [];

    // 번역 작업들을 먼저 시작 (병렬 실행)
    const tasksPromise = Promise.allSettled([

        translateMenu(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("메뉴") }).catch((error) => { failMessage.push(`메뉴실패 ${error.message}`); }),
        translateCategory(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("카테고리") }).catch(() => { failMessage.push(`카테고리 실패 ${error.message}`); }),
        translateProduct2(frId, lang, cookie, authHeader, resWrite).then(() => { success.push("상품") }).catch(() => { failMessage.push(`상품 실패 ${error.message}`); }),

    ]).then(() => {
        // isDone = true; // 모든 작업이 완료되면 isDone을 true로 설정
    });

    // const words = ['AI가', '상품 번역', '작업 중', '입니다'];
    // let wordIndex = 0;
    // let isDone = false;
    // // 작업이 진행되는 동안 진행 상황 메시지 출력
    // while (!isDone) {
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     const elapsedTime = Date.now() - startTime;
    //     if (elapsedTime < 7000) continue;
    //     if (isDone) continue;
    //     wordIndex = (wordIndex % words.length) + 1;
    //     const message = words.slice(0, wordIndex).join(' ');
    //     resWrite(message);
    // }

    // 작업이 모두 완료될 때까지 대기 (혹시 모를 race condition 방지)
    await tasksPromise;

    let endingment = `(${success.join(",")}) 성공!! `;
    if (failMessage.length !== 0) endingment += (` , ${failMessage.join(",")}`);
    resWrite(endingment);
};




async function translateMenu(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateMenu START ");

    resWrite("CMS에서 메뉴 API 조회 합니다.");
    const taskResult_menu = await cmsWebClient.getMenuList(frId, lang, cookie, authHeader);

    resWrite("AI가 메뉴 번역 시작합니다.");
    const taskResoult_transMenu = await cmsAgent.translateJSON(taskResult_menu, lang);
    resWrite("AI가 메뉴 번역을 완료 하였습니다.");

    const taskResult_SaveMenuResult = await cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader);
    resWrite("CMS에서 메뉴 저장 완료.");

    debug("===translateMenu DONE ");
};

async function translateCategory(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateCategory STRAT ");

    resWrite("CMS에서 카테고리 API 조회 합니다.");
    const taskResult_category = await cmsWebClient.getCategoryList(frId, lang, cookie, authHeader);

    resWrite("AI가 카테고리 번역 시작합니다.");

    // 50개씩 나눠서 병렬로 번역 실행
    const taskResoult_transCategory = await parallelTaskRun(
        taskResult_category,
        50,
        (chunk) => cmsAgent.translateJSON(chunk, lang),
        (total) => {
            debug(`카테고리 번역 완료 (${total}/${taskResult_category.length})`);
            resWrite(`카테고리 번역 완료 (${total}/${taskResult_category.length})`);
        }
    );

    resWrite("AI가 카테고리 번역을 완료 하였습니다.");

    const taskResult_SaveCategoryResult = await cmsWebClient.postCategoryTranslationList(frId, taskResoult_transCategory, cookie, authHeader);
    resWrite("CMS에서 카테고리 저장 완료.");

    debug("===translateCategory DONE ");
};



const translatorAgentService = {
    testStream,
    runTranslateMenuProcess,
};

export default translatorAgentService;


async function translateProduct2(frId, lang, cookie, authHeader, resWrite) {
    debug("===translateProduct START ");

    resWrite("CMS에서 상품 API 조회 합니다.");
    const taskResult_product = await cmsWebClient.getProductList(frId, lang, cookie, authHeader);

    resWrite("AI가 상품 번역 시작합니다.");

    // 50개씩 나눠서 병렬로 번역 실행
    const taskResoult_transProduct = await parallelTaskRun(
        taskResult_product,
        50,
        (chunk) => cmsAgent.translateJSON(chunk, lang),
        (total) => {
            debug(`상품 번역 완료 (${total}/${taskResult_product.length})`);
            resWrite(`상품 번역 완료 (${total}/${taskResult_product.length})`);
        }
    );

    resWrite("AI가 상품 번역을 완료 하였습니다.");
    
    resWrite("CMS에서 상품 저장 요청 합니다.");
    const taskResult_SaveProductResult = await cmsWebClient.postProductTranslationList(frId, taskResoult_transProduct, cookie, authHeader);
    resWrite("CMS에서 상품 저장 완료.");

    debug("===translateProduct DONE ");
};


// =======================================================
// ==================PRAVITE METHOD=======================
// =======================================================

/**
 * 어레이를 사이즈만큼 잘라서 2중 배열로 리턴함.
 * @param {*} array
 * @param {*} size
 * @returns [[]]
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * 배열을 청크로 나누고 병렬로 작업 실행
 * @param {Array} items - 처리할 배열
 * @param {number} chunkSize - 청크 크기
 * @param {Function} taskFunction - 각 청크에 실행할 비동기 함수
 * @param {Function} progressCallback - 진행상황 콜백 (current, total) => void
 * @returns {Promise<Array>} 병합된 결과 배열
 */
async function parallelTaskRun(items, chunkSize, taskFunction, progressCallback) {
    const chunks = chunkArray(items, chunkSize);

    let successLangth = 0;
    const results = await Promise.all(
        chunks.map(async (chunk, index) => {
            // if (progressCallback) {
            //     progressCallback(index + 1, chunks.length);
            // }
            const taskResoult = await taskFunction(chunk);
            successLangth += taskResoult.length
            if (progressCallback) {
                progressCallback( successLangth );
            }
            return taskResoult;
        })
    );

    return results.flat();
};
