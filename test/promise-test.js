import { debug } from "../src/config/logger";

async function main() {
    try {
        const stream = test();
        for await (const chunkContent of stream) console.log(chunkContent);

    } catch (error) {
        
    }
};

// await new Promise(resolve => setTimeout(resolve(1), 3000));
// async function sleep(mt) {
//     return await new Promise(resolve => setTimeout(resolve, mt));
// }

async function test(mt) {
    const num = Math.floor(Math.random() * 5) + 1;
    return await new Promise(resolve => setTimeout(() => resolve(num), mt));
}


async function* target1(frId, lang, cookie, authHeader) {

    yield "호출 아래의 3개 병렬로 실행"

    let t1Res, t2Res, t3Res;
    const task1 = sleep(2000).then(r=> t1Res=r).catch(err => console.error("task1 error:", err));
    const task2 = sleep(2500).then(r=> t2Res=r).catch(err => console.error("task1 error:", err));
    const task3 = sleep(4000).then(r=> t3Res=r).catch(err => console.error("task1 error:", err));

    await Promise.allSettled([task1, task2, task3]);
    yield "병렬 종료.";
    
    const lastResult = t1Res + t2Res + t3Res;
    yield `${lastResult}결과.`;
};

main();