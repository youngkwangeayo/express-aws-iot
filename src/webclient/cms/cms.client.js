import axios from "axios";
import { debug } from "../../config/logger.js";
import { APIError } from "../../model/apiResponseModel.js";
import { CMSResponseModel } from "./cms.responseModel.js";
import { WebclientError } from "../WebclientErrorModel.js";


const CMS_API = process.env.CMS_API_ADDR;

async function getMenuList(frId, cookie, authHeader) {
    // debug(` 요청 : ${CMS_API}/menu/v1/getMenuList?frId=${frId}`, { headers: { Authorization: authHeader, Cookie: cookie,} } );

    let reqResult;
    try {
        reqResult = await axios.get(`${CMS_API}/menu/v1/getMenuList?frId=${frId}`, {
            headers: {
                Authorization: authHeader, // 그대로 전달
                Cookie: cookie,      // 문자열로 변환 후 전달
            }
        });
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    };
    
    const apiResult = new CMSResponseModel(reqResult.data);
    
    const result = apiResult.data.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
    }));
    // debug("get menu",JSON.stringify(result).substring(0,30));
    return result;
};

async function getCategoryList(frId, cookie, authHeader) {
    // debug(` 요청 : ${CMS_API}/menu/v1/getCategoryList?frId=${frId}`, { headers: { Authorization: authHeader, Cookie: cookie,} } );
    let reqResult;
    try {
        reqResult = await axios.get(`${CMS_API}/menu/v1/getCategoryList?frId=${frId}`, {
            headers: {
                Authorization: authHeader, // 그대로 전달
                Cookie: cookie,      // 문자열로 변환 후 전달
            }
        });
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    }
    const apiResult = new CMSResponseModel(reqResult.data);

    const result = apiResult.data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryInfo: item.categoryInfo
    }));
    // debug("get category",JSON.stringify(result).substring(0,30));
    return result;
};

async function getProductList(frId, cookie, authHeader) {
    let reqResult;
    try {
        reqResult = await axios.get(`${CMS_API}/menu/v1/getProductList?frId=${frId}&rows=10000`, {
            headers: {
                Authorization: authHeader, // 그대로 전달
                Cookie: cookie,      // 문자열로 변환 후 전달
            }
        });
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    };
    const apiResult = new CMSResponseModel(reqResult.data);

    const result = apiResult.data.map(item => ({
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

   let reqResult;
    try {
        reqResult = await axios.post(`${CMS_API}/menu/v1/saveMenuTranslationList`, bodyWithFrId,
            {
                headers: {
                    "Authorization": authHeader, // 그대로 전달
                    "Cookie": cookie,      // 문자열로 변환 후 전달
                    "Content-Type": "application/json",
                }
            }
        );
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    };
    
    const apiResult = new CMSResponseModel(reqResult.data);
    debug("cms post 결과 : ",apiResult);
    return apiResult;
};

async function postCategoryTranslationList(frId, body, cookie, authHeader) {
    // body 배열의 각 객체에 frId 추가
    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));
    let reqResult;
    try {
        
        reqResult = await axios.post(`${CMS_API}/menu/v1/saveCategoryTranslationList`, bodyWithFrId,
            {
                headers: {
                    "Authorization": authHeader, // 그대로 전달
                    "Cookie": cookie,      // 문자열로 변환 후 전달
                    "Content-Type": "application/json",
                }
            }
        );
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    };
    
    const apiResult = new CMSResponseModel(reqResult.data);
    debug("cms post 결과 : ",apiResult);
};

async function postProductTranslationList(frId, body, cookie, authHeader) {
    // body 배열의 각 객체에 frId 추가
    const bodyWithFrId = body.map(item => ({
        ...item,
        frId: frId
    }));
    
    let reqResult;
    try {

        reqResult = await axios.post(`${CMS_API}/menu/v1/saveProductTranslationList`, bodyWithFrId,
            {
                headers: {
                    "Authorization": authHeader, // 그대로 전달
                    "Cookie": cookie,      // 문자열로 변환 후 전달
                    "Content-Type": "application/json",
                }
            }
        );
    } catch (error) {
        throw new WebclientError(error, 'CMS');
    };
    const apiResult = new CMSResponseModel(reqResult.data);
    debug("cms post 결과 : ",apiResult);
    return apiResult;
};


const cmsWebClient = {
    getMenuList, getCategoryList, getProductList,
    postMenuTranslationList, postCategoryTranslationList, postProductTranslationList
};
export default cmsWebClient;

