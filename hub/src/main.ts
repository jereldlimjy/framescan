import { HubSubscriber } from "./hubSubscriber";
import { HubEventType, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import Pino from "pino";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const client = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT ?? "");
    const logger = Pino({
        level: "info",
    });

    const hubSubscriber = new HubSubscriber("casts", client, logger, [
        HubEventType.MERGE_MESSAGE,
        HubEventType.MERGE_ON_CHAIN_EVENT,
    ]);

    await hubSubscriber.start(0);
}

main().catch((err) => {
    console.log(err);
});
