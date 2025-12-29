class APIResopnse {

    /** @type {import("express").Response} */
    #res = null;

    constructor(data) {
        this.code = 0;
        this.message = 'success';
        this.state = 200;
        this.data = data;

        this.#res = res;
    }

    static build() { return new APIResopnse(); }

    setMessage(value) { this.message = value; return this; };
    setCode(value) { this.code = value; return this; };
    setState(value) { this.state = value; return this; };
    setData(value) { this.data = value; return this; };

    setRes(value) { this.#res = value; return this; };
    send = (data) => {
        this.setData(data);
        this.#res.json(this);
    };

};

class APIError extends Error {
    constructor(code, state, message, reason) {
        super(message);
        this.success = 0;
        this.code = code ?? -1;
        this.statusCode = state ?? 500;
        this.message = message;
        this.error = "error";

    };

    static build() { return new APIError(); }

    setMessage(value) { this.message = value; return this; };
    setCode(value) { this.code = value; return this; };
    setStatusCode(value) { this.statusCode = value; return this; };

    toJSON() {
        return {
            code: this.code,
            error: this.error,
            statusCode: this.statusCode,
            message: this.message
        };
    }
};



export { APIResopnse, APIError };