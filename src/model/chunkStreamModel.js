class ChunkedStreamHeader {
    /**
     * Chunk Streaming용 헤더 설정
     * SSE와 달리 text/event-stream이 아니라 JSON/플레인 텍스트 기반
     * @param {import("express").Response} res - Express response 객체
     */
    static setHeaders(res) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        return res;
    }

    /**
     * JSON chunk 전송
     */
    static send(res, chunkModel) {
        res.write(chunkModel.serialize());
    }

    /**
     * 스트림 종료
     */
    static close(res, endMeta = null) {
        const endChunk = new ChunkResponse("")
            .setType("end")
            .setFinish(true)
            .setMeta(endMeta);

        res.write(endChunk.serialize());
        res.end();
    }
}


class ChunkResponse {
    
    /** @type {import("express").Response} */
    #res = null;
    /**
     * 
     * @param {import("express").Response} res 
     * @param {string} content 
     */
    constructor(res, content) {
        this.id = `chunk_${Date.now()}`;
        this.timestamp = Date.now();
        this.type = "chunk";  // chunk | end | error
        this.content = content ?? "";
        this.meta = null;
        this.finish = false;

        this.#res = res;
    }

    static build(res, content) {
        return new ChunkResponse(res, content);
    }

    setId(value) { this.id = value; return this; }
    setType(value) { this.type = value; return this; }
    setContent(value) { this.content = value; return this; }
    setMeta(value) { this.meta = value; return this; }
    setFinish(value) { this.finish = value; return this; }

    setRes(value) { this.#res = value; return this; }

    /**
     * 순수 Chunk Streaming용 직렬화
     * SSE 포맷이 아니라 JSON + newline으로만 구성됨
     * ex) {"chunk":"hello"}\n
     */
    serialize() {
        return JSON.stringify(this) + "\n";
    };


    resWrite = (content) => {
        this.setContent(content);
        this.#res.write(this.serialize());
    };

    resEnd = () => {
        this.setType("end");
        this.setFinish(true);
        this.#res.write(this.serialize());
        this.#res.end();
    };

    resError = (content) => {
        this.setContent(content);
        this.setType("error");
        this.setFinish(true);
        this.#res.write(this.serialize());
        this.#res.end();
    };
}


export { ChunkedStreamHeader, ChunkResponse };
