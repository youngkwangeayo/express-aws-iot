// mqttService.js
import { mqtt, iot } from 'aws-iot-device-sdk-v2';

class AwsIotMqttService {
  #client = null;
  #conn = null;
  #initialized = false;
  #initializing = null; // 진행 중인 초기화 Promise (중복 호출 방지)

  #buildConfig({ endpoint, certPath, keyPath, caPath, clientId, cleanSession = false }) {
    return iot.AwsIotMqttConnectionConfigBuilder
      .new_mtls_builder_from_path(certPath, keyPath)
      .with_certificate_authority_from_path(undefined, caPath)
      .with_client_id(clientId || `node-${Date.now()}`)
      .with_clean_session(cleanSession)
      .with_endpoint(endpoint)
      .build();
  }

  // 🔒 내부 전용 초기화
  async #initInternal({ endpoint, certPath, keyPath, caPath, clientId, cleanSession = false }) {
    if (this.#initialized) return this.#conn;
    if (this.#initializing) return this.#initializing;

    if (!endpoint || !certPath || !keyPath || !caPath) {
      throw new Error('endpoint, certPath, keyPath, caPath는 필수입니다.');
    }

    const config = this.#buildConfig({ endpoint, certPath, keyPath, caPath, clientId, cleanSession });
    this.#client = new mqtt.MqttClient();
    this.#conn = this.#client.new_connection(config);

    this.#conn.on('connect', () => console.log('✅ AWS IoT 연결 성공'));
    this.#conn.on('disconnect', () => console.log('❌ AWS IoT 연결 끊김'));
    this.#conn.on('interrupt', (err) => console.warn('⚠️ 연결 중단:', err?.message || err));
    this.#conn.on('resume', (code, session) => console.log(`🔄 재연결 성공 (code=${code}, session=${session})`));

    // 중복 방지 위해 진행 중 Promise 보관
    this.#initializing = (async () => {
      await this.#conn.connect();
      this.#initialized = true;
      return this.#conn;
    })();

    try {
      return await this.#initializing;
    } finally {
      this.#initializing = null; // 완료/실패 후 초기화
    }
  }

  // 🌐 외부 공개: fire-and-forget init (내부에서 catch)
  init(config) {
    this.#initInternal(config).catch((err) => {
      console.error('❌ AWS IoT 초기화 실패:', err);
    });
  }

  // 필요 시 대기형 보조 메서드도 제공 (원하면 await로 보장)
  async waitReady() {
    if (this.#initialized) return true;
    if (this.#initializing) {
      await this.#initializing;
      return true;
    }
    throw new Error('MQTT가 아직 init되지 않았습니다. 먼저 init()을 호출하세요.');
  }

  async publish(topic, payload, qos = mqtt.QoS.AtLeastOnce) {
    if (!this.#conn) throw new Error('init() 이후에 사용하세요.');
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await this.#conn.publish(topic, data, qos);
  }

  async subscribe(topic, handler, qos = mqtt.QoS.AtLeastOnce) {
    if (!this.#conn) throw new Error('init() 이후에 사용하세요.');
    if (typeof handler !== 'function') throw new Error('handler는 함수여야 합니다.');
    await this.#conn.subscribe(topic, qos, (t, payload) => {
      try { handler(t, payload); } catch (e) { console.error('handler error:', e); }
    });
  }

  get connection() { return this.#conn; }
  get initialized() { return this.#initialized; }
}

const mqttService = new AwsIotMqttService(); // ✅ 싱글톤 인스턴스
export default mqttService;
