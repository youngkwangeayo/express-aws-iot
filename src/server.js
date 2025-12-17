
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger  from './config/logger.js';
import systemRouter from './router/system.router.js';
import errorHendler from './middleware/error.hanlder.js';
import loggingMiddleware from './middleware/logging.middleware.js';
import OPENAI from './config/openai.js';
import translatorAgentRouter from './router/translator-agent.router.js';
import cmsAgent from './agent/cms-agent/agent.js';


const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 - 특정 도메인만 허용하는 경우
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       'https://a.example.com',
//       'https://b.example.com'
//     ];
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };
// app.use(cors(corsOptions));

// CORS 설정 - 모든 도메인 허용
app.use(cors());

app.use(express.json());

app.use(loggingMiddleware);

app.use(systemRouter);
app.use("/translator-agent",translatorAgentRouter)//translator-agent
app.use(errorHendler);


const bootStrep = async () => {
  try {
    logger.info('부트스트랩 시작 - 초기화 작업 실행 중...');

    // 여러 init 함수들을 병렬로 실행
    await Promise.all([
      cmsAgent.init()
      // OPENAI.init(),
      // otherService.init(),
      // anotherService.init(),
    ]);
    logger.info('모든 초기화 작업 완료');


    // 모든 초기화가 완료된 후 서버 시작
    app.listen(PORT, () => {
      logger.info(`메세지.`, { test: "good" });
      logger.info(`서버가 포트 ${PORT}에서 시작되었습니다.`, process.cwd());
    });

  } catch (error) {
    logger.error('부트스트랩 실패:', error);
    process.exit(1);
  };
};

bootStrep();

