import { Router } from "express";
import logger from "../config/logger.js";

const systemRouter = Router();



systemRouter.get('/', (req, res) => {
  logger.info('루트 엔드포인트 접근');
  res.json({ message: 'Express ESM 서버가 실행 중입니다!' });
});

systemRouter.get('/health', (req, res) => {
  logger.info(`헬스체크 엔드포인트 접근. timestamp: ${new Date().toISOString()}`);
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});



export default systemRouter;



