import { request, Router } from "express";
import { debug } from "../config/logger.js";
import logger from "../config/logger.js";

import { validateMenuListTranslation, validateMenuTranslation } from "../validations/menu-translation.validate.js";
import translatorAgentService from "../service/translator-agent.service.js";

import { APIError, APIResopnse } from "../model/apiResponseModel.js";
import { SSEChunk, SSEHeader } from "../model/sseChunkModel.js";
import { ChunkedStreamHeader, ChunkResponse } from "../model/chunkStreamModel.js";
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

    
    await cmsWebClient.getMenuList("10107");
    

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



// =======================================================
//          Stream API. 추후 파일 따로분리
// =======================================================
translatorAgentRouter.post('/menu-translation', validateMenuListTranslation, async (req, res) => {
    throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
    const cookie = req.headers.cookie;
    const authHeader = req.headers.authorization;

    debug(req.matchedData);

    ChunkedStreamHeader.setHeaders(res);
    const streamChunk = ChunkResponse.build(res);
    streamChunk.resWrite("언어 번역을 시작합니다.");

    try {
        await translatorAgentService.runTranslateMenuProcess(req.matchedData.frId, req.matchedData.lang, cookie, authHeader, streamChunk.resWrite);
    } catch (error) {
        debug(error);
        return streamChunk.resError(error.message);
    };
    return streamChunk.resEnd();
});


/**
 *  Stream Chunk
 */
translatorAgentRouter.post('/menu-translation/:lang', validateMenuTranslation, async (req, res,) => {
    const cookie = req.headers.cookie;
    const authHeader = req.headers.authorization;

    debug(req.matchedData);

    ChunkedStreamHeader.setHeaders(res);
    const streamChunk = ChunkResponse.build(res);
    
    streamChunk.resWrite("언어 번역을 시작합니다.");
    try {
        await translatorAgentService.runTranslateMenuProcess(req.matchedData.frId, req.matchedData.lang, cookie, authHeader, streamChunk.resWrite);
    } catch (error) {
        debug(error);
        return streamChunk.resError(error.message);
    };
    return streamChunk.resEnd();
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


export default translatorAgentRouter;

