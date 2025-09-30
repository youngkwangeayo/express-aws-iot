# Node.js 공식 이미지 사용 (Alpine 버전으로 경량화)
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐싱 최적화)
# COPY package*.json ./
# 소스 코드 복사
COPY ./ ./

# 의존성 설치
# RUN npm ci --only=production
RUN npm install


# 로그 디렉토리 생성
RUN mkdir -p logs

# certificate 권한 설정
RUN chmod 600 src/certificate/* && \
    chmod 644 src/certificate/AmazonRootCA1.pem

# # 포트 3000 노출
# EXPOSE 3000

# 애플리케이션 시작
CMD ["npm", "start"]