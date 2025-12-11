import { request, Router } from "express";
import { debug } from "../config/logger.js";
import logger from "../config/logger.js";

import { validateMenuListTranslation, validateMenuTranslation } from "../validations/menu-translation.validate.js";
import translatorAgentService from "../service/translator-agent.service.js";

import { APIError, APIResopnse } from "../model/apiResponseModel.js";
import { SSEChunk, SSEHeader } from "../model/sseChunkModel.js";


const translatorAgentRouter = Router();

translatorAgentRouter.get('/health', (req, res) => {
    logger.info(`헬스체크 엔드포인트 접근. timestamp: ${new Date().toISOString()}`);
    res.json({ status: 'OK', timestamp: new Date().toISOString(), message: "translatorAgent Healthy" });

});


translatorAgentRouter.post('/menu-translation', validateMenuListTranslation, (req, res) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    SSEHeader.setHeaders(res);

    res.write(`data: [DONE]\n\n`);
    res.end();
});



translatorAgentRouter.post('/menu-translation/:lang', validateMenuTranslation, async (req, res,) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    debug(req.matchedData);
    
    const cookie = req.headers.cookie;
    const authHeader = req.headers.authorization;

    SSEHeader.setHeaders(res);
    const sseChunk = SSEChunk.build();
    res.write( sseChunk.setContent("언어 번역을 시작합니다.").toSSE() );

    try {
        const stream = translatorAgentService.runTranslateMenuProcess( req.matchedData.frId, lang, cookie, authHeader );
        for await (const chunkContent of stream) res.write( sseChunk.setContent(chunkContent).toSSE() );
    } catch (error) {
        
    }

    
    // res.write( sseChunk.setContent("CMS 메뉴 조회 요청 중 입니다.").toSSE() );
    // await translatorAgentService.callCMSMenu(req.matchedData.frId, lang, cookie, authHeader);

    res.write(`data: ${cookie}\n\n`);

    res.write(`data: [DONE]\n\n`);
    res.end();
});

translatorAgentRouter.post("/test-sse", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
        debug("SSE 테스트 엔드포인트 시작");

        // testStream 서비스를 사용하여 500ms 간격으로 스트리밍
        const stream = translatorAgentService.testStream();

        for await (const chunk of stream) res.write(`data: ${chunk}\n\n`);

        // 완료 메시지 전송
        res.write(`data: [DONE]\n\n`);
        logger.info("SSE 테스트 엔드포인트 완료");
        res.end();
    } catch (err) {
        logger.error(`SSE 테스트 엔드포인트 에러: ${err.message}`);
        res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
        res.end();
    }
});

translatorAgentRouter.post('/test-post', (req, res) => {
    // throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    let test = new APIResopnse();
    res.json(test);
});

export default translatorAgentRouter;

