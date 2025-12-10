
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger  from './config/logger.js';
import systemRouter from './router/system.router.js';
import errorHendler from './middleware/error.hanlder.js';
import loggingMiddleware from './middleware/logging.middleware.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(loggingMiddleware);

app.use(systemRouter);

app.use(errorHendler);

app.listen(PORT, () => {

  logger.info(`메세지.`, { test: "good" });
  logger.info(`서버가 포트 ${PORT}에서 시작되었습니다.`, process.cwd());
});
