"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubSubscriber = void 0;
const neverthrow_1 = require("neverthrow");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
class HubSubscriber extends tiny_typed_emitter_1.TypedEmitter {
    constructor(label, hubClient, log, eventTypes) {
        super();
        this.stopped = true;
        this.stream = null;
        this.label = label;
        this.hubClient = hubClient;
        this.log = log;
        this.eventTypes = eventTypes;
    }
    stop() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.cancel();
        this.stopped = true;
        this.log.info(`Stopped HubSubscriber ${this.label}`);
    }
    destroy() {
        if (!this.stopped)
            this.stop();
        this.hubClient.$.close();
    }
    _waitForReadyHubClient() {
        return new Promise((resolve) => {
            var _a;
            (_a = this.hubClient) === null || _a === void 0 ? void 0 : _a.$.waitForReady(Date.now() + 500, (e) => {
                return e ? resolve((0, neverthrow_1.err)(e)) : resolve((0, neverthrow_1.ok)(undefined));
            });
        });
    }
    start(fromId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Starting HubSubscriber ${this.label}`);
            const hubClientReady = yield this._waitForReadyHubClient();
            if (hubClientReady.isErr()) {
                this.log.error(`HubSubscriber ${this.label} failed to connect to hub: ${hubClientReady.error}`);
                throw hubClientReady.error;
            }
            this.log.info(`HubSubscriber ${this.label} connected to hub`);
            const subscribeParams = {
                eventTypes: this.eventTypes,
                fromId,
            };
            const subscribeRequest = yield this.hubClient.subscribe(subscribeParams);
            subscribeRequest
                .andThen((stream) => {
                this.log.info(`HubSubscriber ${this.label} subscribed to hub events (types ${JSON.stringify(this.eventTypes)})`);
                this.stream = stream;
                this.stopped = false;
                stream.on("close", () => __awaiter(this, void 0, void 0, function* () {
                    this.log.info(`HubSubscriber ${this.label} stream closed`);
                    this.stopped = true;
                    this.stream = null;
                }));
                void this.processStream(stream);
                return (0, neverthrow_1.ok)(stream);
            })
                .orElse((e) => {
                this.log.error(`Error starting hub stream: ${e}`);
                return (0, neverthrow_1.err)(e);
            });
        });
    }
    processStream(stream) {
        var _a, stream_1, stream_1_1;
        var _b, e_1, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug(`HubSubscriber ${this.label} started processing hub event stream`);
            try {
                try {
                    for (_a = true, stream_1 = __asyncValues(stream); stream_1_1 = yield stream_1.next(), _b = stream_1_1.done, !_b; _a = true) {
                        _d = stream_1_1.value;
                        _a = false;
                        const event = _d;
                        this.emit("event", event);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_a && !_b && (_c = stream_1.return)) yield _c.call(stream_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // biome-ignore lint/suspicious/noExplicitAny: error catching
            }
            catch (e) {
                if (this.stopped) {
                    this.log.info(`Hub event stream processing stopped: ${e.message}`);
                }
                else {
                    this.log.info(`Hub event stream processing halted unexpectedly: ${e.message}`);
                    this.log.info(`HubSubscriber ${this.label} restarting hub event stream in 5 seconds...`);
                    yield new Promise((resolve) => setTimeout(resolve, 5000));
                    void this.start();
                }
            }
        });
    }
}
exports.HubSubscriber = HubSubscriber;
