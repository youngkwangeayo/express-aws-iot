import { Router } from "express";
import { debug } from "../../config/logger.js";
import logger from "../../config/logger.js";

import { validateMenuListTranslation, validateMenuTranslation } from "./translator-agent.validate.js";
import translatorAgentService from "./translator-agent.service.js";

import { APIError, APIResopnse } from "../../model/apiResponseModel.js";


const translatorAgentRouter = Router();

translatorAgentRouter.get('/health', (req, res) => {
    logger.info(`헬스체크 엔드포인트 접근. timestamp: ${new Date().toISOString()}`);
    res.json({ status: 'OK', timestamp: new Date().toISOString(), message: "translatorAgent Healthy" });

});

translatorAgentRouter.post('/test-post', (req, res) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    let test = new APIResopnse();
    res.json(test);
});


export default translatorAgentRouter;

