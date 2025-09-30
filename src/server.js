import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import logger, { loggerMiddleware } from './middleware/logger.js';
import mqttService from './middleware/mqtt.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(loggerMiddleware);
app.use(express.json());

app.get('/', (req, res) => {
  logger.info('루트 엔드포인트 접근');
  res.json({ message: 'Express ESM 서버가 실행 중입니다!' });
});

app.get('/health', (req, res) => {
  logger.info('헬스체크 엔드포인트 접근');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  

 mqttService.init({
    endpoint: process.env.AWS_IOT_ENDPOINT,
    certPath: path.join(process.cwd(), process.env.AWS_IOT_CERT_PATH),
    keyPath: path.join(process.cwd(), process.env.AWS_IOT_KEY_PATH),
    caPath: path.join(process.cwd(), process.env.AWS_IOT_CA_PATH),
    clientId: process.env.AWS_IOT_CLIENT_ID,
    cleanSession: false,
    onConnect: () => console.log('[APP] connected'),
    onDisconnect: () => console.log('[APP] disconnected'),
  });

  logger.info(`메세지.`, {test:"good"} );
  logger.info(`서버가 포트 ${PORT}에서 시작되었습니다.`, process.cwd());
});