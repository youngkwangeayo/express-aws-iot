import OpenAI from "openai";
import { MENU_TRANSLATION_PROMPT } from "./prompt.js";
import { debug } from "../../config/logger.js";

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
        debug(JSON.stringify(originalJson).substring(0,30) , lang);

       const response = await this.#client.responses.create({
            model: "gpt-4.1",
            instructions: MENU_TRANSLATION_PROMPT,
            temperature: 0,
            input: [
                { role: "user", content: `Translate this JSON to ${lang}:` },
                { role: "user", content: JSON.stringify(originalJson, null, 2) }
            ]

        });
        debug("AGENT RETUEN : ",JSON.stringify(response.output_text).substring(0,30), typeof (response.output_text).substring(0,30));

        if( response.error ) throw new Error("일단 에이전트 에러");
        
        const result = JSON.parse(response.output_text);
        return result;
    };

    // translateJSONToStream2 = async function* (originalJson = "", lang) {

    //     const response = await this.#client.chat.completions.create({
    //         model: "gpt-4.1",
    //         temperature: 0,
    //         stream: true,
    //         messages: [
    //             { role: "system", content: MENU_TRANSLATION_PROMPT },
    //             { role: "user", content: `Translate this JSON to ${lang}:\n\n${JSON.stringify(originalJson, null, 2)}` },
    //         ],
    //     });
    //     const stream = response.choices[0].message.content;
    //     for await (const chunk of stream) {
    //         yield content = chunk.choices[0]?.delta?.content || "";
    //     };
    // };


    translateJSONToStream = async function* (originalJson = "", lang) {

        const response = await this.#client.responses.create({
            model: "gpt-4.1",
            instructions: MENU_TRANSLATION_PROMPT,
            temperature: 0,
            stream: true,
            input: [
                { role: "user", content: `Translate this JSON to ${lang}:` },
                { role: "user", content: JSON.stringify(originalJson, null, 2) }
            ]

        });
        for await (const event of response) {
            // Responses API 스트리밍 텍스트 추출
            // const text = event?.output_text ?? "";
            yield event;
            // if (text) {
            //     yield text;
            // }
        }


    };

};


const cmsAgent = new CMSagent();
export default cmsAgent;
