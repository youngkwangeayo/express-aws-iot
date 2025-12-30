import OpenAI from "openai";
import { MENU_TRANSLATION_PROMPT } from "./prompt.js";
import { debug } from "../../config/logger.js";
import fs from "fs/promises";
import path from "path";
import { APIError } from "../../model/apiResponseModel.js";

/*
모델명	설명
gpt-4.1	GPT-4 계열의 최신 플래그십 모델. 고품질 reasoning.
gpt-4.1-mini	4.1보다 가볍고 빠름. 가격 저렴.
gpt-4o	"Omni" 모델. 멀티모달(텍스트+음성+이미지) 강력.
gpt-4o-mini	4o의 경량·저비용 버전. 대부분의 일반 챗 작업에 최고 효율.
*/

class CMSagent {
    static #instance = null;

    models = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini"]

    /** @type {OpenAI} */
    #client = null;

    constructor() {
        if (CMSagent.#instance) return CMSagent.#instance;
        CMSagent.#instance = this;
    };

    async init() {
        if (process.env.OPENAI_API_KEY == null || process.env.OPENAI_API_KEY?.trim() == "") throw new Error("ENV OPENAI_API_KEY MISSING");

        this.#client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    };

    async translateJSON(originalJson = "", lang) {
        debug(JSON.stringify(originalJson).substring(0, 30), lang);

        let response;
        try {
            response = await this.#client.responses.create({
                model: "gpt-4.1",
                instructions: MENU_TRANSLATION_PROMPT,
                temperature: 0,
                input: [
                    { role: "user", content: `Translate this JSON to ${lang}:` },
                    { role: "user", content: JSON.stringify(originalJson, null, 2) }
                ]

            });
            debug("AGENT RETUEN : ", JSON.stringify(response.output_text).substring(0, 30), typeof (response.output_text).substring(0, 30));
        } catch (error) {
            throw new APIError().setStatusCode(error.status).setMessage(`Agent ERROR : ${error.message}`);
        };
        if (response.error) throw new APIError().setStatusCode(error.status).setMessage(`Agent ERROR : ${error.message}`);

        const result = JSON.parse(response.output_text);
        return result;
    };

    async translateFileTEXT(fileText = "", lang) {
        console.log('[cms-agent] translateJSON input:', fileText.substring(0, 30), lang);

        let response;
        try {
            response = await this.#client.responses.create({
                model: "gpt-4.1",
                instructions: FILE_TEXT_TRANSLATION_PROMPT,
                temperature: 0,
                input: [
                    { role: "user", content: `Translate this JSON to ${lang}:` },
                    { role: "user", content: fileText }
                ]

            });
            console.log('[cms-agent] AGENT RETURN:', response.output_text.substring(0, 30));
        } catch (error) {
            throw APIError.build().setStatusCode(error.status).setMsg(`Agent ERROR : ${error.message}`);
        };
        if (response.error) throw APIError.build().setStatusCode(error.status).setMsg(`Agent ERROR : ${error.message}`);

        return response.output_text;
    };

    translateJSONStream = async function (originalJson = "", lang) {
        throw new Error("미구현");
        const response = await this.#client.responses.create({
            model: "gpt-4.1",
            instructions: MENU_TRANSLATION_PROMPT,
            stream: true,
            temperature: 0,
            input: [
                { role: "user", content: `Translate this JSON to ${lang}:` },
                { role: "user", content: JSON.stringify(originalJson, null, 2) }
            ]

        });
        if (response.error) throw new Error("일단 에이전트 에러");

        // response 는 async iterator(ReadableStream 형태)
        let fullText = "";

        // 타임스탬프로 고유한 파일명 생성
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(process.cwd(), 'logs', 'stream-output');
        await fs.mkdir(outputDir, { recursive: true });
        const filePath = path.join(outputDir, `stream-${timestamp}.txt`);

        for await (const event of response) {

            const chunk = "\n >> " + JSON.stringify(event);
            fullText += event.output_text;
            // 파일에 실시간으로 추가
            await fs.appendFile(filePath, chunk, 'utf-8');
        }

        debug("Stream output saved to:", filePath);
        fs.appendFile(path.join(outputDir, `res.txt`), fullText, "utf-8");
        return fullText;
    };

};


const cmsAgent = new CMSagent();
export default cmsAgent;
