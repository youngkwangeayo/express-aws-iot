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

    await Promise.allSettled([taskTranslateMenu, taskTranslatCategory, taskTranslateProduct]).then((result)=>{
        debug("여기 출력될까요?",result)
    });
    yield `번역 완료하였습니다. ${lang} 메뉴를 저장합니다.`;

    // const taskPostMenu = cmsWebClient.postMenuTranslationList(frId, resultP1, cookie, authHeader).then(r => p1Result = r).catch(err => console.error("task1 error:", err));
    // const taskPostCategory = cmsWebClient.postCategoryTranslationList(frId, resultP2, cookie, authHeader).then(r => p2Result = r).catch(err => console.error("task1 error:", err));
    // const taskPostProduct = cmsWebClient.postProductTranslationList(frId, resultP3, cookie, authHeader).then(r => p3Result = r).catch(err => console.error("task1 error:", err));

    // await Promise.allSettled( [taskPostMenu, taskPostCategory, taskPostProduct] );
    yield `${lang}다국어 메뉴 저장 완료하였습니다.`;
};



async function* runMultipleTranslateMenuProcess(frId, langs, cookie, authHeader) {

    yield "cms에서 menu정보를 불러오고있습니다.";

    // 1. 원본 데이터를 1번만 병렬로 가져오기
    let menuData, categoryData, productData;
    const taskGetMenu = cmsWebClient.getMenuList(frId, langs[0], cookie, authHeader).then(r => menuData = r).catch(err => console.error("getMenu error:", err));
    const taskGetCategory = cmsWebClient.getCategoryList().then(r => categoryData = r).catch(err => console.error("getCategory error:", err));
    const taskGetProduct = cmsWebClient.getProductList().then(r => productData = r).catch(err => console.error("getProduct error:", err));

    await Promise.allSettled([taskGetMenu, taskGetCategory, taskGetProduct]);
    yield `번역 작업에 돌입합니다. (${langs.length}개 언어: ${langs.join(', ')})`;

    // 2. 각 언어별로 메뉴, 카테고리, 프로덕트 번역을 병렬로 실행
    const translationResults = {};
    const translationTasks = [];

    for (const lang of langs) {
        translationResults[lang] = {};

        const menuTask = cmsAgent.translateJSON(menuData, lang)
            .then(r => translationResults[lang].menu = r)
            .catch(err => console.error(`translateMenu ${lang} error:`, err));

        const categoryTask = cmsAgent.translateJSON(categoryData, lang)
            .then(r => translationResults[lang].category = r)
            .catch(err => console.error(`translateCategory ${lang} error:`, err));

        const productTask = cmsAgent.translateJSON(productData, lang)
            .then(r => translationResults[lang].product = r)
            .catch(err => console.error(`translateProduct ${lang} error:`, err));

        translationTasks.push(menuTask, categoryTask, productTask);
    }

    await Promise.allSettled(translationTasks);
    yield `번역 완료하였습니다. (총 ${translationTasks.length}개 작업) ${langs.join(', ')} 언어의 메뉴를 저장합니다.`;

    // 3. 각 언어별로 저장 작업을 병렬로 실행
    const saveTasks = [];

    for (const lang of langs) {
        const menuSaveTask = cmsWebClient.postMenuTranslationList(frId, translationResults[lang].menu, cookie, authHeader)
            .catch(err => console.error(`saveMenu ${lang} error:`, err));

        const categorySaveTask = cmsWebClient.postMenuTranslationList(frId, translationResults[lang].category, cookie, authHeader)
            .catch(err => console.error(`saveCategory ${lang} error:`, err));

        const productSaveTask = cmsWebClient.postMenuTranslationList(frId, translationResults[lang].product, cookie, authHeader)
            .catch(err => console.error(`saveProduct ${lang} error:`, err));

        saveTasks.push(menuSaveTask, categorySaveTask, productSaveTask);
    }

    await Promise.allSettled(saveTasks);
    yield `${langs.join(', ')} 다국어 메뉴 저장 완료하였습니다. (총 ${saveTasks.length}개 작업)`;
};



const translatorAgentService = {
    testStream,
    runTranslateMenuProcess,
    runMultipleTranslateMenuProcess,
};

export default translatorAgentService;


