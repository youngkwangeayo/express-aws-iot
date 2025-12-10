import { v4 } from "uuid";

const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const requestId = v4();
    res.locals.requestId = requestId;

    console.log(`[INFO] [${requestId}] ${req.headers['x-forwarded-for'] || req.ip} : ${req.headers['user-agent']} -- ${req.method.toUpperCase()} / ${req.hostname + req.url} / ${JSON.stringify(req.body)}`);


    res.on("finish", () => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`[INFO] [${requestId}] Status : ${res.statusCode}  / Duration : ${duration}s `);
    })
    next();
}

export default loggingMiddleware;



// Response Body 값 포함
// const loggingMiddleware = (req, res, next) => {
//     const startTime = Date.now();
//     const requestId = v4();
//     res.locals.requestId = requestId;

//     console.log(`[INFO] [${requestId}] ${req.headers['x-forwarded-for'] || req.ip} : ${req.headers['user-agent']} -- ${req.method.toUpperCase()} / ${req.hostname + req.url} / ${JSON.stringify(req.body)}`);


//     // 원본 res.json과 res.send 메서드 저장
//     const originalJson = res.json.bind(res);
//     const originalSend = res.send.bind(res);

//     // res.json 오버라이드
//     res.json = function (data) {
//         res.locals.responseBody = data;
//         return originalJson(data);
//     };

//     // res.send 오버라이드
//     res.send = function (data) {
//         res.locals.responseBody = data;
//         return originalSend(data);
//     };

//     res.on("finish", () => {
//         const duration = ((Date.now() - startTime) / 1000).toFixed(2);

//         try {
//             const responseBody = res.locals.responseBody
//                 ? JSON.stringify(res.locals.responseBody).substring(0, 1000) // 최대 1000자까지만
//                 : 'N/A';

//             console.log(`[INFO] [${requestId}] Status : ${res.statusCode}  / Duration : ${duration}s ${responseBody}`);
//         } catch (error) {
//             console.log(`[INFO] [${requestId}] Status : ${res.statusCode}  / Duration : ${duration}s ${res.locals.responseBody}`);
//         };


//     })
//     next();
// }