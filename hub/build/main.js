"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hubSubscriber_1 = require("./hubSubscriber");
const hub_nodejs_1 = require("@farcaster/hub-nodejs");
const pino_1 = __importDefault(require("pino"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const client = (0, hub_nodejs_1.getSSLHubRpcClient)((_a = process.env.HUB_RPC_ENDPOINT) !== null && _a !== void 0 ? _a : "");
        const logger = (0, pino_1.default)({
            level: "info",
        });
        const hubSubscriber = new hubSubscriber_1.HubSubscriber("casts", client, logger, [
            hub_nodejs_1.HubEventType.MERGE_MESSAGE,
            hub_nodejs_1.HubEventType.MERGE_ON_CHAIN_EVENT,
        ]);
        yield hubSubscriber.start(0);
    });
}
main().catch((err) => {
    console.log(err);
});
