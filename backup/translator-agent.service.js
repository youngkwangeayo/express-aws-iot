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
    const taskGetCategory = cmsWebClient.getCategoryList(frId, lang, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList(frId, lang, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";
    
    let resultP1, resultP2, resultP3;
    const taskTranslateMenu = cmsAgent.translateJSON(p1Result, lang).then(r => resultP1 = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(p2Result, lang).then(r => resultP2 = r).catch(err => console.error("task1 error:", err));
    const taskTranslateProduct = cmsAgent.translateJSON(p3Result, lang).then(r => resultP3 = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]);
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, resultP2, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskPostProduct = cmsWebClient.postProductTranslationList(frId, resultP3, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};


async function* runSyncTask(task1, task2) {

    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader);
    
}


const translatorAgentService = {
    testStream,
    runTranslateMenuProcess
};

export default translatorAgentService;



async function* taskAsync(frId, lang, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    let taskResult_menu, taskResult_category, taskResult_product;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => taskResult_menu = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList(frId, lang, cookie, authHeader).then(r => taskResult_category = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList(frId, lang, cookie, authHeader).then(r => taskResult_product = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";


    let taskResoult_transMenu, taskResoult_transCategory, taskResoult_transProduct;
    const taskTranslation = [
        {
            name: "메뉴",
            promise: cmsAgent.translateJSON(taskResult_menu, lang).then(r => taskResoult_transMenu = r).catch(err => console.error("menu translation error:", err))
        },
        {
            name: "카테고리",
            promise: cmsAgent.translateJSON(taskResult_category, lang)
                .then(r => taskResoult_transCategory = r)
                .catch(err => console.error("category translation error:", err))
        },
        {
            name: "상품",
            promise: cmsAgent.translateJSON(taskResult_product, lang)
                .then(r => taskResoult_transProduct = r)
                .catch(err => console.error("product translation error:", err))
        }
    ];
    const pending = new Set(taskTranslation);


    while (pending.size > 0) {
        const finished = await Promise.race( Array.from(pending).map(task => task.promise.then(() => task) ) );
        pending.delete(finished);

        yield `${finished.name} 번역 완료`;
    }


    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    // const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader).then(r => taskResult_menu = r).catch(err => console.error("task1 error:", err));
    // const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, taskResoult_transCategory, cookie, authHeader).then(r => taskResult_category = r).catch(err => console.error("task1 error:", err));
    // const taskPostProduct = cmsWebClient.postProductTranslationList(frId, taskResoult_transProduct, cookie, authHeader).then(r => taskResult_product = r).catch(err => console.error("task1 error:", err));

    // await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};



async function* backup(frId, lang, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    let p1Result, p2Result, p3Result;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList(frId, lang, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList(frId, lang, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";
    
    let resultP1, resultP2, resultP3;
    const taskTranslateMenu = cmsAgent.translateJSON(p1Result, lang).then(r => resultP1 = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(p2Result, lang).then(r => resultP2 = r).catch(err => console.error("task1 error:", err));
    const taskTranslateProduct = cmsAgent.translateJSON(p3Result, lang).then(r => resultP3 = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]);
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, resultP2, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskPostProduct = cmsWebClient.postProductTranslationList(frId, resultP3, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};


async function* runTranslateMenuProcess(frId, lang, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    let p1Result, p2Result, p3Result;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList(frId, lang, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList(frId, lang, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";
    
    let resultP1, resultP2, resultP3;
    const taskTranslateMenu = cmsAgent.translateJSON(p1Result, lang).then(r => resultP1 = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(p2Result, lang).then(r => resultP2 = r).catch(err => console.error("task1 error:", err));
    // const taskTranslateProduct = cmsAgent.translateJSON(p3Result, lang).then(r => resultP3 = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory]);
    yield `메뉴 및 카테고리 번역 완료하였습니다.`;

    // 상품 번역 스트림 처리
    yield `상품 번역을 시작합니다... (스트림 방식)`;

    try {
        const openAiStream = await cmsAgent.translateJSONStream(p3Result, lang);
        let accumulatedText = "";
        let chunkCount = 0;

        for await (const aiChunk of openAiStream) {
            const chunkText = aiChunk.output_text ?? "";
            accumulatedText += chunkText;
            chunkCount++;

            // 중간 진행 상황 전송 (매 10개 청크마다)
            if (chunkCount % 10 === 0) {
                // yield `[진행중] ${chunkCount}개 청크 수신...`;
            }

            // 청크 내용 전송
            if (chunkText) {
                yield chunkText;
            }
        }

        // 스트림 완료 후 JSON 파싱하여 resultP3에 저장
        resultP3 = JSON.parse(accumulatedText);
        yield `상품 번역 완료 (총 ${chunkCount}개 청크 처리)`;

    } catch (error) {
        logger.error("상품 번역 스트림 처리 중 오류:", error);
        yield `상품 번역 중 오류 발생: ${error.message}`;
        throw error;
    }



    // const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    // const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, resultP2, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    // const taskPostProduct = cmsWebClient.postProductTranslationList(frId, resultP3, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    // await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};