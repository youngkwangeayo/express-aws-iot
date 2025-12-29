import { request, Router } from "express";
import { debug } from "../config/logger.js";
import logger from "../config/logger.js";

import { validateMenuListTranslation, validateMenuTranslation } from "../validations/menu-translation.validate.js";
import translatorAgentService from "../service/translator-agent.service.js";

import { APIError, APIResopnse } from "../model/apiResponseModel.js";
import cmsWebClient from "../webclient/cms/cms.client.js";


const translatorAgentRouter = Router();

// =======================================================
//          REST API.
// =======================================================
translatorAgentRouter.get('/health', (req, res) => {
    logger.info(`헬스체크 엔드포인트 접근. timestamp: ${new Date().toISOString()}`);
    res.json({ status: 'OK', timestamp: new Date().toISOString(), message: "translatorAgent Healthy" });

});

translatorAgentRouter.post('/test-post', async (req, res) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    const response = APIResopnse.build().setRes(res);

    const data = {hello : "world"};
    response.send(data);
});
translatorAgentRouter.post('/test-post', async (req, res) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");

    

    const startTime = Date.now();
    let isDone = false;

    while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 7000) continue;
        if (isDone) continue;
        isDone = true;
    };

    let test = new APIResopnse();
    res.json(test);
});



export default translatorAgentRouter;

