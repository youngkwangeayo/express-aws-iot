import axios from "axios";
import { debug } from "../../config/logger.js";



async function getMenuList(frId, cookie, authHeader) {
    debug(` 요청 : https://dev-cms.nextpay.co.kr/menu/v1/getMenuList?frId=${frId}`, {
            headers: {
                Authorization: authHeader,
                Cookie: cookie,
            }
        }
    );

    let sample = await axios.get(`https://dev-cms.nextpay.co.kr/menu/v1/getMenuList?frId=${frId}`, {
        headers: {
            Authorization: authHeader, // 그대로 전달
            Cookie: cookie,      // 문자열로 변환 후 전달
        }
    });
    
    const result = sample.data.data.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
    }));
    debug(result);
    return result;
};

async function getCategoryList(frId, lang, cookie, authHeader) {

    let sample = await axios.get(`https://dev-cms.nextpay.co.kr/menu/v1/getCategoryList?frId=${frId}`, {
        headers: {
            Authorization: authHeader, // 그대로 전달
            Cookie: cookie,      // 문자열로 변환 후 전달
        }
    });
    const result = sample.data.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo
    }));
    return result;
};

async function getProductList(frId, lang, cookie, authHeader) {

    let sample = await axios.get(`https://dev-cms.nextpay.co.kr/menu/v1/getProductList?frId=${frId}`, {
        headers: {
            Authorization: authHeader, // 그대로 전달
            Cookie: cookie,      // 문자열로 변환 후 전달
        }
    });
    const result = sample.data.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo
    }));
    return result;
};


async function postMenuTranslationList(frId, body, cookie, authHeader) {

    // body 배열의 각 객체에 frId 추가
    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    let result = await axios.post(`https://dev-cms.nextpay.co.kr/menu/v1/saveMenuTranslationList`, bodyWithFrId,
        {
            headers: {
                "Authorization": authHeader, // 그대로 전달
                "Cookie": cookie,      // 문자열로 변환 후 전달
                "Content-Type": "application/json",
            }
        }
    );
    debug(result);
};
async function postCategoryTranslationList(frId, lang, cookie, authHeader) {
    let tmp;
    let result = await axios.post(`menu/v1/saveMenuTranslationList`, tmp,
        {
            headers: {
                "Authorization": authHeader, // 그대로 전달
                "Cookie": cookie,      // 문자열로 변환 후 전달
                "Content-Type": "application/json",
            }
        }
    );
};
async function postProductTranslationList(frId, lang, cookie, authHeader) {
    let tmp;
    let result = await axios.post(`menu/v1/saveMenuTranslationList`, tmp,
        {
            headers: {
                "Authorization": authHeader, // 그대로 전달
                "Cookie": cookie,      // 문자열로 변환 후 전달
                "Content-Type": "application/json",
            }
        }
    );
};

const cmsWebClient = { getMenuList, getCategoryList, getProductList, postMenuTranslationList };
export default cmsWebClient;