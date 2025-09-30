aws ecs execute-command --cluster ecs-dev-coffeezip --task 02c7430117b24ef7be2a0d5ec87419ba --container coffeezip-cms --interactive --command '/bin/sh'

openssl s_client -connect "$IOT_ENDPOINT:8883" \
  -cert /app/certs/device.pem.crt \
  -key  /app/certs/private.pem.key \
  -CAfile /app/certs/AmazonRootCA1.pem -tls1_2 -quiet

printenv

AWS_IOT_ENDPOINT="d09968931olf0r6syv9my-ats.iot.ap-northeast-2.amazonaws.com"
AWS_IOT_CERT_PATH="src/certificate/coffeezip-cms-certificate.pem.crt"
AWS_IOT_KEY_PATH="src/certificate/coffeezip-cms-private.pem.key"
AWS_IOT_CA_PATH="src/certificate/AmazonRootCA1.pem"
AWS_IOT_CLIENT_ID="testcidhugo"

# MQTT over TLS 연결 테스트
  openssl s_client -connect d09968931olf0r6syv9my-ats.iot.ap-northeast-2.amazonaws.com:8883 \
    -CAfile src/certificate/AmazonRootCA1.pem \
    -cert src/certificate/coffeezip-cms-certificate.pem.crt \
    -key src/certificate/coffeezip-cms-private.pem.key

  4. curl을 사용한 HTTP 발행

  # REST API를 통한 메시지 발행
  curl -X POST \
    --cert <certificate.pem.crt> \
    --key <private.pem.key> \
    --cacert <root-ca.pem> \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello from curl"}' \
    "https://<your-iot-endpoint>:8443/topics/topic/test"

 Root CA: Amazon Root CA 1 (AmazonRootCA1.pem)
  - Certificate: 디바이스 인증서 (.pem.crt)
  - Private Key: 디바이스 프라이빗 키 (.pem.key)
  - Endpoint: AWS IoT Core 엔드포인트 URL
