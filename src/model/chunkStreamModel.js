
class SSEHeader {
    /**
     * SSE (Server-Sent Events) 헤더를 response 객체에 설정
     * @param {import("express").Response} res - Express response 객체
     */
    static setHeaders(res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        return res;
    }

    /**
     * SSE 형식으로 데이터 전송
     * @param {Object} res - Express response 객체
     * @param {Object} data - 전송할 데이터
     * @param {string} event - 이벤트 이름 (선택사항)
     */
    static send(res, data, event = null) {
        if (event) {
            res.write(`event: ${event}\n`);
        }
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    /**
     * SSE 연결 종료
     * @param {Object} res - Express response 객체
     */
    static close(res) {
        res.end();
    }
};


class SSEChunk {
    constructor(content) {
        this.id = `chunk_${Date.now()}`;
        this.timestamp = Date.now();
        this.type = "chunk";      // chunk | end | error
        this.content = content;   // 스트리밍되는 텍스트
        this.meta = null;         // 필요 시 추가 정보
        this.finish = false;      // 마지막 청크 여부
    }

    // 정적 빌더
    static build(content) {
        return new SSEChunk(content);
    }

    setId(value) { this.id = value; return this; }
    setType(value) { this.type = value; return this; }
    setContent(value) { this.content = value; return this; }
    setMeta(value) { this.meta = value; return this; }
    setFinish(value) { this.finish = value; return this; }

    // SSE로 전송 가능한 문자열로 변환
    toSSE() {
        return `data: ${JSON.stringify(this)}\n\n`;
    }
}



export { SSEHeader, SSEChunk }