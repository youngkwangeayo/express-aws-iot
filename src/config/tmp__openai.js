

// import OpenAI from "openai";

// /*
// 모델명	설명
// gpt-4.1	GPT-4 계열의 최신 플래그십 모델. 고품질 reasoning.
// gpt-4.1-mini	4.1보다 가볍고 빠름. 가격 저렴.
// gpt-4o	"Omni" 모델. 멀티모달(텍스트+음성+이미지) 강력.
// gpt-4o-mini	4o의 경량·저비용 버전. 대부분의 일반 챗 작업에 최고 효율.
// */

// class CustomOpenAI {
//     static #instance = null;

//     models = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini"]

//     #client = null;

//     constructor() {
//         if (CustomOpenAI.#instance) return CustomOpenAI.#instance;
//         CustomOpenAI.#instance = this;
//     };

//     async init() {
//         if (process.env.OPENAI_API_KEY == null || process.env.OPENAI_API_KEY?.trim() == "") throw new Error("ENV OPENAI_API_KEY MISSING");

//         this.#client = new OpenAI({
//             apiKey: process.env.OPENAI_API_KEY,
//         });
//         // await new Promise(resolve => setTimeout(resolve, 3000));
//     };

//     async askTranslatorAgent(message = "") {

//         await this.#client.chat.completions.create({
//             model: "gpt-4.1",
//             temperature: 0,
//             messages: [
//                 { role: "system", content: "규칙들..." },
//                 { role: "user", content: `Translate this JSON to English:\n\n${JSON.stringify(originalJson, null, 2)}` },
//             ],
//         });
//     };
    
// };

// export default CustomOpenAI;
