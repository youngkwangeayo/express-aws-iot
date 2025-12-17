import axios from "axios";
import logger from "../src/config/logger.js";
import { debug } from "../src/config/logger.js";
import cmsAgent from "../src/agent/cms-agent/agent.js";
import cmsWebClient from "../src/webclient/cms/index.js";
import { APIError } from "../src/model/apiResponseModel.js";

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

    let taskResult_menu, taskResult_category, taskResult_product;
    const taskGetMenu = cmsWebClient.getMenuList(frId, lang, cookie, authHeader).then(r => taskResult_menu = r).catch(err => console.error("task1 error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList(frId, lang, cookie, authHeader).then(r => taskResult_category = r).catch(err => console.error("task1 error:", err));
    const taskGetProduct = cmsWebClient.getProductList(frId, lang, cookie, authHeader).then(r => taskResult_product = r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield "번역 작업에 돌입합니다.";

    let taskResoult_transMenu, taskResoult_transCategory, taskResoult_transProduct;
    const taskTranslateMenu = cmsAgent.translateJSON(taskResult_menu, lang).then(r => taskResoult_transMenu = r).catch(err => console.error("task1 error:", err));
    const taskTranslatCategory = cmsAgent.translateJSON(taskResult_category, lang).then(r => taskResoult_transCategory = r).catch(err => console.error("task1 error:", err));
    const taskTranslateProduct = cmsAgent.translateJSON(taskResult_product, lang).then(r => { taskResoult_transProduct = r; return "product" }).catch(err => console.error("task1 error:", err));


    const words = ['AI가', '상품 번역', '작업 중', '입니다'];
    let wordIndex = 0;
    const startTime = Date.now();
    let isDone = false;
    while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 7000) continue;
        wordIndex = (wordIndex % words.length) + 1;
        const message = words.slice(0, wordIndex).join(' ');
        yield message;
    };

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]);
    isDone = true;
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    // const taskPostMenu     = cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader).then(r => taskResult_menu = r).catch(err => console.error("task1 error:", err));
    // const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, taskResoult_transCategory, cookie, authHeader).then(r => taskResult_category = r).catch(err => console.error("task1 error:", err));
    // const taskPostProduct  = cmsWebClient.postProductTranslationList(frId, taskResoult_transProduct, cookie, authHeader).then(r => taskResult_product = r).catch(err => console.error("task1 error:", err));

    // await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};




async function translateMenu(frId, lang, cookie, authHeader) {
    debug("===translateMenu START ");

    const taskResult_menu = await cmsWebClient.getMenuList(frId, lang, cookie, authHeader);


    const taskResoult_transMenu = await cmsAgent.translateJSON(taskResult_menu, lang);

    // const taskResult_SaveMenuResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader);
    debug("===translateMenu DONE ");
};

async function translateCategory(frId, lang, cookie, authHeader) {
    debug("===translateCategory STRAT ");

    const taskResult_category = await cmsWebClient.getCategoryList(frId, lang, cookie, authHeader);

    const taskResoult_transCategory = await cmsAgent.translateJSON(taskResult_category, lang);

    // const taskResult_SaveCategoryResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transCategory, cookie, authHeader);

    debug("===translateCategory DONE ");
};

async function translateProduct(frId, lang, cookie, authHeader) {
    debug("===translateProduct START ");
    const taskResult_product = await cmsWebClient.getProductList(frId, lang, cookie, authHeader);


    const translationPromise = await cmsAgent.translateJSON(taskResult_product, lang);

    // const taskResult_SaveProductResult = cmsWebClient.postMenuTranslationList(frId, translationResult, cookie, authHeader);
    debug("===translateProduct DONE ");
};


const translatorAgentService = {
    testStream,
    runTranslateMenuProcess,
    runTranslateMenuProcess2
};

export default translatorAgentService;



// ======================== 미사용 ====================================




async function* runTranslateMenuProcess2(frId, lang, cookie, authHeader) {
     const words = ['AI가', '상품 번역', '작업 중', '입니다'];
    let wordIndex = 0;
    let lastMessageTime = Date.now();
    let isDone = false;

    const menuGen = translateMenu2(frId, lang, cookie, authHeader);
    const categoryGen = translateCategory2(frId, lang, cookie, authHeader);
    const productGen = translateProduct2(frId, lang, cookie, authHeader);

    const generators = [
        { gen: menuGen, done: false, pending: null },
        { gen: categoryGen, done: false, pending: null },
        { gen: productGen, done: false, pending: null }
    ];

    // 각 generator의 첫 번째 next() 호출 시작
    generators.forEach(g => {
        g.pending = g.gen.next();
    });

    // 모든 generator가 완료될 때까지 반복
    while (generators.some(g => !g.done)) {
        // 완료되지 않은 generator들의 pending promise 수집
        const pendingPromises = generators
            .map((g, idx) =>
                g.pending ? g.pending.then(result => ({ idx, result })) : null
            )
            .filter(p => p !== null);

        if (pendingPromises.length === 0) break;

        // 가장 먼저 완료되는 청크를 기다림
        const { idx, result } = await Promise.race(pendingPromises);

        if (result.done) {
            // generator 완료
            generators[idx].done = true;
            generators[idx].pending = null;
        } else {
            // 청크를 yield하고 다음 청크 요청
            yield result.value;
            generators[idx].pending = generators[idx].gen.next();
        }
        
        // 해당부분 - 1초마다 진행상황 메시지 전송
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastMessageTime;
        if (elapsedTime >= 1000) {
            wordIndex = (wordIndex % words.length) + 1;
            const message = words.slice(0, wordIndex).join(' ');
            yield message;
            lastMessageTime = currentTime;
        }
    }


   



    debug("===여기는언제===")
    yield "여기는언제"
}


async function* translateMenu2(frId, lang, cookie, authHeader) {
    debug("===translateMenu START ");
    yield `cms에서 menu 정보를 불러오고있습니다.`;
    const taskResult_menu = await cmsWebClient.getMenuList(frId, lang, cookie, authHeader);

    yield `AI가 menu 번역 작업 중 입니다.`;
    const taskResoult_transMenu = await cmsAgent.translateJSON(taskResult_menu, lang);
    yield `AI menu 번역 작업 완료.`;

    // const taskResult_SaveMenuResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transMenu, cookie, authHeader);
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
    debug("===translateMenu DONE ");
};

async function* translateCategory2(frId, lang, cookie, authHeader) {
    debug("===translateCategory STRAT ");

    yield `cms에서 카테고리 정보를 불러오고있습니다.`;
    const taskResult_category = await cmsWebClient.getCategoryList(frId, lang, cookie, authHeader);

    yield `AI가 카테고리 번역 작업 중 입니다.`;
    const taskResoult_transCategory = await cmsAgent.translateJSON(taskResult_category, lang);
    yield `AI 카테고리 번역 작업 완료.`;

    // const taskResult_SaveCategoryResult = cmsWebClient.postMenuTranslationList(frId, taskResoult_transCategory, cookie, authHeader);
    yield `${lang}다국어 카테고리 저장 완료하였습니다.`;

    debug("===translateCategory DONE ");
};

async function* translateProduct2(frId, lang, cookie, authHeader) {
    debug("===translateProduct START ");
    yield `cms에서 상품 정보를 불러오고있습니다.`;
    const taskResult_product = await cmsWebClient.getProductList(frId, lang, cookie, authHeader);

    yield `AI가 상품 번역 작업 중 입니다.`;

    const translationPromise = await cmsAgent.translateJSON(taskResult_product, lang);
    yield `AI 상품 번역 작업 완료.`;

    // const taskResult_SaveProductResult = cmsWebClient.postMenuTranslationList(frId, translationResult, cookie, authHeader);
    yield `${lang}다국어 상품 저장 완료하였습니다.`;
    debug("===translateProduct DONE ");
};
