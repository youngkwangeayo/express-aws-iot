import axios from "axios";
import { debug } from "../../config/logger.js";



async function getMenuList(frId, cookie, authHeader) {
    // debug(` 요청 : https://dev-cms.nextpay.co.kr/menu/v1/getMenuList?frId=${frId}`, {
    //     headers: {
    //         Authorization: authHeader,
    //         Cookie: cookie,
    //     }
    // }
    // );

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
    // debug("get menu",JSON.stringify(result).substring(0,30));
    return result;
};

async function getCategoryList(frId, cookie, authHeader) {

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
    // debug("get category",JSON.stringify(result).substring(0,30));
    return result;
};

async function getProductList(frId, cookie, authHeader) {

    let sample = await axios.get(`https://dev-cms.nextpay.co.kr/menu/v1/getProductList?frId=${frId}`, {
        headers: {
            Authorization: authHeader, // 그대로 전달
            Cookie: cookie,      // 문자열로 변환 후 전달
        }
    });
    const result = sample.data.data.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productInfo: item.productInfo
    }));
    //  debug("get product",JSON.stringify(result).substring(0,30));
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
async function postCategoryTranslationList(frId, body, cookie, authHeader) {
    // body 배열의 각 객체에 frId 추가
    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    let result = await axios.post(`https://dev-cms.nextpay.co.kr/menu/v1/saveCategoryTranslationList`, bodyWithFrId,
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
async function postProductTranslationList(frId, body, cookie, authHeader) {
    // body 배열의 각 객체에 frId 추가
    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));

    let result = await axios.post(`https://dev-cms.nextpay.co.kr/menu/v1/saveProductTranslationList`, bodyWithFrId,
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

const cmsWebClient = {
    getMenuList, getCategoryList, getProductList,
    postMenuTranslationList, postCategoryTranslationList, postProductTranslationList
};
export default cmsWebClient;