import OpenAI from "openai";
import { MENU_TRANSLATION_PROMPT } from "./prompt.js";

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

        const response = await this.#client.chat.completions.create({
            model: "gpt-4.1",
            temperature: 0,
            messages: [
                { role: "system", content: MENU_TRANSLATION_PROMPT },
                { role: "user", content: `Translate this JSON to ${lang}:\n\n${JSON.stringify(originalJson, null, 2)}` },
            ],
        });
        const translatedJson = response.choices[0].message.content;
        return translatedJson;
    };

    translateJSONToStream = async function* (originalJson = "", lang) {

        const response = await this.#client.chat.completions.create({
            model: "gpt-4.1",
            temperature: 0,
            stream: true,
            messages: [
                { role: "system", content: MENU_TRANSLATION_PROMPT },
                { role: "user", content: `Translate this JSON to ${lang}:\n\n${JSON.stringify(originalJson, null, 2)}` },
            ],
        });
        const stream = response.choices[0].message.content;
        for await (const chunk of stream) {
            yield content = chunk.choices[0]?.delta?.content || "";
        };
    };

};


const cmsAgent = new CMSagent();
export default cmsAgent;
