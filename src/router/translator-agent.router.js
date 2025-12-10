import { Router } from "express";
import { debug } from "../config/logger.js";
import logger from "../config/logger.js";
import { APIError } from "../model/apiResponseModel.js";
import translatorAgentService from "../service/translator-agent.service.js";


const translatorAgentRouter = Router();


translatorAgentRouter.get('/health', (req, res) => {
    logger.info(`헬스체크 엔드포인트 접근. timestamp: ${new Date().toISOString()}`);
    res.json({ status: 'OK', timestamp: new Date().toISOString(), message: "translatorAgent Healthy" });

});


translatorAgentRouter.post('/translation', (req, res) => {
    throw APIError.build().setStatusCode(501).setMessage("Not Implemented");
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



